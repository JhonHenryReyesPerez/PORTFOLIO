package io.github.jhonhenryreyesperez.portfolio.ratelimit;

import java.time.Clock;
import java.time.Duration;

import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import io.github.jhonhenryreyesperez.portfolio.config.AssistantProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Aplica dos límites a las preguntas del chat: uno por visitante (evita abusos)
 * y uno global por día (protege el saldo de la API aunque lleguen muchos visitantes).
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

	private static final String GLOBAL_KEY = "*";

	private final FixedWindowRateLimiter perClient;
	private final FixedWindowRateLimiter global;

	public RateLimitInterceptor(AssistantProperties properties, Clock clock) {
		this.perClient = new FixedWindowRateLimiter(
				properties.perClient().maxRequests(), properties.perClient().window(), clock);
		this.global = new FixedWindowRateLimiter(
				properties.global().maxRequests(), properties.global().window(), clock);
	}

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
		if (!HttpMethod.POST.matches(request.getMethod())) {
			return true;
		}

		Duration wait = perClient.tryAcquire(clientKey(request));
		if (!wait.isZero()) {
			throw new RateLimitExceededException("Hiciste muchas preguntas seguidas. Espera un momento y vuelve a intentarlo.", wait);
		}

		wait = global.tryAcquire(GLOBAL_KEY);
		if (!wait.isZero()) {
			throw new RateLimitExceededException("El asistente alcanzó su límite de hoy. Puedes escribirle a Jhon por correo.", wait);
		}
		return true;
	}

	/**
	 * Identifica al visitante por su IP. Detrás del proxy de Render la IP real llega en
	 * cabeceras; si alguien las falsifica, el límite global sigue protegiendo el saldo.
	 */
	static String clientKey(HttpServletRequest request) {
		for (String header : new String[] { "CF-Connecting-IP", "True-Client-IP" }) {
			String value = request.getHeader(header);
			if (value != null && !value.isBlank()) {
				return value.strip();
			}
		}
		String forwarded = request.getHeader("X-Forwarded-For");
		if (forwarded != null && !forwarded.isBlank()) {
			return forwarded.split(",")[0].strip();
		}
		return request.getRemoteAddr();
	}
}
