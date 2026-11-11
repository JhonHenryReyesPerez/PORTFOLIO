package io.github.jhonhenryreyesperez.portfolio.ratelimit;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Límite simple en memoria: como máximo {@code maxRequests} por clave dentro de cada ventana.
 * Suficiente para una sola instancia; con varias habría que moverlo a Redis o similar.
 */
public class FixedWindowRateLimiter {

	/** Por encima de este número de claves se limpian las ventanas vencidas. */
	private static final int CLEANUP_THRESHOLD = 10_000;

	private final int maxRequests;
	private final Duration window;
	private final Clock clock;
	private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

	public FixedWindowRateLimiter(int maxRequests, Duration window, Clock clock) {
		this.maxRequests = maxRequests;
		this.window = window;
		this.clock = clock;
	}

	/**
	 * Registra un intento para la clave.
	 *
	 * @return {@link Duration#ZERO} si se permite, o el tiempo que falta para que se reinicie la ventana
	 */
	public Duration tryAcquire(String key) {
		Instant now = clock.instant();
		Window current = windows.compute(key, (k, existing) -> existing == null || !now.isBefore(existing.resetAt())
				? new Window(now.plus(window), 1)
				: new Window(existing.resetAt(), existing.count() + 1));

		if (windows.size() > CLEANUP_THRESHOLD) {
			windows.values().removeIf(w -> !now.isBefore(w.resetAt()));
		}

		return current.count() <= maxRequests ? Duration.ZERO : Duration.between(now, current.resetAt());
	}

	private record Window(Instant resetAt, int count) {
	}
}
