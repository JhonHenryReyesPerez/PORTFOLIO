package io.github.jhonhenryreyesperez.portfolio.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.time.Duration;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import io.github.jhonhenryreyesperez.portfolio.ai.DeepSeekClient.Message;
import io.github.jhonhenryreyesperez.portfolio.config.DeepSeekProperties;

class DeepSeekClientTest {

	private static final String BASE_URL = "https://deepseek.test";
	private static final List<Message> MESSAGES = List.of(new Message("system", "S"), new Message("user", "Hola"));

	private final RestClient.Builder builder = RestClient.builder().baseUrl(BASE_URL);
	private final MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();

	@Test
	void sendsTheConversationAndReturnsTheTrimmedReply() {
		DeepSeekClient client = new DeepSeekClient(builder, properties("sk-test"));
		server.expect(requestTo(BASE_URL + "/chat/completions"))
				.andExpect(method(HttpMethod.POST))
				.andExpect(header("Authorization", "Bearer sk-test"))
				.andExpect(jsonPath("$.model").value("deepseek-chat"))
				.andExpect(jsonPath("$.max_tokens").value(350))
				.andExpect(jsonPath("$.messages[1].content").value("Hola"))
				.andRespond(withSuccess("""
						{"id":"x","choices":[{"index":0,"message":{"role":"assistant","content":"  ¡Hola!  "}}],"usage":{}}
						""", MediaType.APPLICATION_JSON));

		assertThat(client.complete(MESSAGES)).isEqualTo("¡Hola!");
		server.verify();
	}

	@Test
	void reportsUnavailableWhenDeepSeekFails() {
		DeepSeekClient client = new DeepSeekClient(builder, properties("sk-test"));
		server.expect(requestTo(BASE_URL + "/chat/completions")).andRespond(withServerError());

		assertThatThrownBy(() -> client.complete(MESSAGES)).isInstanceOf(AssistantUnavailableException.class);
	}

	@Test
	void reportsUnavailableWhenTheReplyIsEmpty() {
		DeepSeekClient client = new DeepSeekClient(builder, properties("sk-test"));
		server.expect(requestTo(BASE_URL + "/chat/completions"))
				.andRespond(withSuccess("{\"choices\":[]}", MediaType.APPLICATION_JSON));

		assertThatThrownBy(() -> client.complete(MESSAGES)).isInstanceOf(AssistantUnavailableException.class);
	}

	@Test
	void doesNotCallTheApiWithoutAKey() {
		DeepSeekClient client = new DeepSeekClient(builder, properties(""));

		assertThatThrownBy(() -> client.complete(MESSAGES)).isInstanceOf(AssistantUnavailableException.class);
		server.verify();
	}

	private static DeepSeekProperties properties(String apiKey) {
		return new DeepSeekProperties(apiKey, BASE_URL, "deepseek-chat", 350, 0.4, Duration.ofSeconds(5));
	}
}
