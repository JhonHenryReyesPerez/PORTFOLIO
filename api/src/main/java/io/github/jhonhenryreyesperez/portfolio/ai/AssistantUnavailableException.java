package io.github.jhonhenryreyesperez.portfolio.ai;

/** El modelo no está disponible (sin clave, caído o con una respuesta inválida). */
public class AssistantUnavailableException extends RuntimeException {

	public AssistantUnavailableException(String message) {
		super(message);
	}

	public AssistantUnavailableException(String message, Throwable cause) {
		super(message, cause);
	}
}
