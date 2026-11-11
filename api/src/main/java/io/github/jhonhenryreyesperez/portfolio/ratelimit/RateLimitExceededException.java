package io.github.jhonhenryreyesperez.portfolio.ratelimit;

import java.time.Duration;

/** Se superó el límite de preguntas; {@code retryAfter} indica cuándo se puede volver a intentar. */
public class RateLimitExceededException extends RuntimeException {

	private final Duration retryAfter;

	public RateLimitExceededException(String message, Duration retryAfter) {
		super(message);
		this.retryAfter = retryAfter;
	}

	public Duration retryAfter() {
		return retryAfter;
	}
}
