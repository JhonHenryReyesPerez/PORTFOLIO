package io.github.jhonhenryreyesperez.portfolio.chat;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

/** Conversación enviada por el chat: los últimos mensajes, el más reciente al final. */
public record ChatRequest(
		@NotEmpty(message = "La conversación está vacía")
		@Size(max = ChatRequest.MAX_MESSAGES, message = "La conversación admite hasta {max} mensajes")
		List<@Valid ChatMessage> messages) {

	public static final int MAX_MESSAGES = 20;
}
