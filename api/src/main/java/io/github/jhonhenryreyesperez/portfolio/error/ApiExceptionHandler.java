package io.github.jhonhenryreyesperez.portfolio.error;

import java.net.URI;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import io.github.jhonhenryreyesperez.portfolio.ai.AssistantUnavailableException;
import io.github.jhonhenryreyesperez.portfolio.chat.InvalidConversationException;
import io.github.jhonhenryreyesperez.portfolio.ratelimit.RateLimitExceededException;

/**
 * Convierte los errores en respuestas RFC 9457 (application/problem+json).
 * El campo "detail" está pensado para mostrarse tal cual en el chat.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	ProblemDetail invalidRequest(MethodArgumentNotValidException ex) {
		String detail = ex.getBindingResult().getFieldErrors().stream()
				.map(FieldError::getDefaultMessage)
				.findFirst()
				.orElse("La petición no es válida");
		return problem(HttpStatus.BAD_REQUEST, "invalid-request", detail);
	}

	@ExceptionHandler({ HttpMessageNotReadableException.class, InvalidConversationException.class })
	ProblemDetail unreadableRequest(Exception ex) {
		String detail = ex instanceof InvalidConversationException ? ex.getMessage() : "El cuerpo de la petición no es un JSON válido";
		return problem(HttpStatus.BAD_REQUEST, "invalid-request", detail);
	}

	@ExceptionHandler(RateLimitExceededException.class)
	ResponseEntity<ProblemDetail> rateLimited(RateLimitExceededException ex) {
		long seconds = Math.max(1, ex.retryAfter().toSeconds());
		return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
				.header(HttpHeaders.RETRY_AFTER, String.valueOf(seconds))
				.body(problem(HttpStatus.TOO_MANY_REQUESTS, "rate-limited", ex.getMessage()));
	}

	@ExceptionHandler(AssistantUnavailableException.class)
	ProblemDetail unavailable(AssistantUnavailableException ex) {
		return problem(HttpStatus.SERVICE_UNAVAILABLE, "assistant-unavailable",
				"El asistente no está disponible en este momento. Puedes escribirle a Jhon por correo.");
	}

	private static ProblemDetail problem(HttpStatus status, String type, String detail) {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
		problem.setType(URI.create("urn:portfolio-api:" + type));
		return problem;
	}
}
