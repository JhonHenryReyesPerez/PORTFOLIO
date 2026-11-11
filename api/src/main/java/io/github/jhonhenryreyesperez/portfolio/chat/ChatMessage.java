package io.github.jhonhenryreyesperez.portfolio.chat;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Un turno de la conversación enviado por el navegador. */
public record ChatMessage(
		@NotNull(message = "Cada mensaje necesita un rol") Role role,
		@NotBlank(message = "El mensaje no puede estar vacío")
		@Size(max = ChatMessage.MAX_LENGTH, message = "Cada mensaje admite hasta {max} caracteres")
		String content) {

	public static final int MAX_LENGTH = 600;

	/** Solo se aceptan turnos de visitante y de asistente; el mensaje de sistema lo pone el servidor. */
	public enum Role {
		@JsonProperty("user") USER,
		@JsonProperty("assistant") ASSISTANT;

		public String apiName() {
			return name().toLowerCase();
		}
	}
}
