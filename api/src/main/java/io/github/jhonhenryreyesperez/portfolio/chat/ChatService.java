package io.github.jhonhenryreyesperez.portfolio.chat;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import io.github.jhonhenryreyesperez.portfolio.ai.DeepSeekClient;
import io.github.jhonhenryreyesperez.portfolio.ai.DeepSeekClient.Message;
import io.github.jhonhenryreyesperez.portfolio.chat.ChatMessage.Role;
import io.github.jhonhenryreyesperez.portfolio.config.AssistantProperties;

/** Arma la conversación (sistema + historial reciente) y obtiene la respuesta del modelo. */
@Service
public class ChatService {

	private final DeepSeekClient client;
	private final KnowledgeBase knowledgeBase;
	private final int maxHistory;

	public ChatService(DeepSeekClient client, KnowledgeBase knowledgeBase, AssistantProperties properties) {
		this.client = client;
		this.knowledgeBase = knowledgeBase;
		this.maxHistory = properties.maxHistory();
	}

	public ChatResponse reply(ChatRequest request) {
		List<ChatMessage> history = request.messages();
		if (history.getLast().role() != Role.USER) {
			throw new InvalidConversationException("La conversación debe terminar con una pregunta del visitante");
		}

		List<ChatMessage> recent = history.subList(Math.max(0, history.size() - maxHistory), history.size());

		List<Message> messages = new ArrayList<>(recent.size() + 1);
		messages.add(new Message("system", knowledgeBase.systemPrompt()));
		for (ChatMessage message : recent) {
			messages.add(new Message(message.role().apiName(), message.content().strip()));
		}

		return new ChatResponse(client.complete(messages));
	}
}
