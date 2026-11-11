package io.github.jhonhenryreyesperez.portfolio.chat;

/** La conversación no tiene la forma esperada (por ejemplo, no termina en una pregunta del visitante). */
public class InvalidConversationException extends RuntimeException {

	public InvalidConversationException(String message) {
		super(message);
	}
}
