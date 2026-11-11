package io.github.jhonhenryreyesperez.portfolio.config;

import java.time.Duration;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Reglas del asistente: quién puede llamarlo, cuánto historial acepta
 * y cuántas preguntas se permiten antes de frenar.
 *
 * @param siteUrl         dirección pública del portafolio (para completar enlaces relativos)
 * @param allowedOrigins  orígenes permitidos por CORS
 * @param maxHistory      mensajes del historial que se envían al modelo
 * @param perClient       límite de peticiones por visitante
 * @param global          límite de peticiones de todo el sitio (protege el saldo de la API)
 */
@ConfigurationProperties("assistant")
public record AssistantProperties(
		String siteUrl,
		List<String> allowedOrigins,
		int maxHistory,
		Limit perClient,
		Limit global) {

	/** Un máximo de peticiones dentro de una ventana de tiempo. */
	public record Limit(int maxRequests, Duration window) {
	}
}
