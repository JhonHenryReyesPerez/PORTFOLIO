package io.github.jhonhenryreyesperez.portfolio.chat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.util.List;
import java.util.stream.IntStream;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import io.github.jhonhenryreyesperez.portfolio.ai.DeepSeekClient;
import io.github.jhonhenryreyesperez.portfolio.ai.DeepSeekClient.Message;
import io.github.jhonhenryreyesperez.portfolio.chat.ChatMessage.Role;
import io.github.jhonhenryreyesperez.portfolio.config.AssistantProperties;
import io.github.jhonhenryreyesperez.portfolio.config.AssistantProperties.Limit;

class ChatServiceTest {

	private final DeepSeekClient client = mock(DeepSeekClient.class);
	private final KnowledgeBase knowledgeBase = mock(KnowledgeBase.class);
	private final ChatService service = new ChatService(client, knowledgeBase,
			new AssistantProperties("https://example.test/", List.of(), 4,
					new Limit(1, Duration.ofMinutes(1)), new Limit(1, Duration.ofDays(1))));

	@Test
	void sendsTheSystemPromptFirstAndReturnsTheReply() {
		when(knowledgeBase.systemPrompt()).thenReturn("SYSTEM");
		when(client.complete(anyList())).thenReturn("Hola");

		ChatResponse response = service.reply(new ChatRequest(List.of(new ChatMessage(Role.USER, "  ¿Quién es Jhon?  "))));

		assertThat(response.reply()).isEqualTo("Hola");
		assertThat(sentMessages()).containsExactly(
				new Message("system", "SYSTEM"),
				new Message("user", "¿Quién es Jhon?"));
	}

	@Test
	void keepsOnlyTheMostRecentHistory() {
		when(knowledgeBase.systemPrompt()).thenReturn("SYSTEM");
		when(client.complete(anyList())).thenReturn("ok");
		List<ChatMessage> history = IntStream.rangeClosed(1, 7)
				.mapToObj(i -> new ChatMessage(i % 2 == 1 ? Role.USER : Role.ASSISTANT, "m" + i))
				.toList();

		service.reply(new ChatRequest(history));

		assertThat(sentMessages()).extracting(Message::content)
				.containsExactly("SYSTEM", "m4", "m5", "m6", "m7");
	}

	@Test
	void rejectsAConversationThatDoesNotEndWithTheVisitor() {
		ChatRequest request = new ChatRequest(List.of(
				new ChatMessage(Role.USER, "Hola"),
				new ChatMessage(Role.ASSISTANT, "¡Hola!")));

		assertThatThrownBy(() -> service.reply(request)).isInstanceOf(InvalidConversationException.class);
		verifyNoInteractions(client);
	}

	@SuppressWarnings("unchecked")
	private List<Message> sentMessages() {
		ArgumentCaptor<List<Message>> captor = ArgumentCaptor.forClass(List.class);
		verify(client).complete(captor.capture());
		return captor.getValue();
	}
}
