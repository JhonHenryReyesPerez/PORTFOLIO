package io.github.jhonhenryreyesperez.portfolio.ai;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import io.github.jhonhenryreyesperez.portfolio.config.DeepSeekProperties;

/**
 * Llama al endpoint /chat/completions de DeepSeek y devuelve el texto de la respuesta.
 * Cualquier fallo (sin clave, red, 4xx/5xx, respuesta vacía) se traduce en
 * {@link AssistantUnavailableException}, que el chat muestra como un aviso amable.
 */
@Component
public class DeepSeekClient {

	private static final Logger log = LoggerFactory.getLogger(DeepSeekClient.class);

	private final RestClient restClient;
	private final DeepSeekProperties properties;

	public DeepSeekClient(RestClient.Builder deepSeekRestClientBuilder, DeepSeekProperties properties) {
		this.restClient = deepSeekRestClientBuilder.build();
		this.properties = properties;
	}

	public String complete(List<Message> messages) {
		if (!properties.isConfigured()) {
			throw new AssistantUnavailableException("La clave de DeepSeek no está configurada");
		}

		CompletionRequest body = new CompletionRequest(
				properties.model(), messages, properties.maxTokens(), properties.temperature(), false);

		try {
			CompletionResponse response = restClient.post()
					.uri("/chat/completions")
					.header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.apiKey())
					.contentType(MediaType.APPLICATION_JSON)
					.body(body)
					.retrieve()
					.body(CompletionResponse.class);

			return extractText(response);
		} catch (RestClientException ex) {
			log.warn("DeepSeek no respondió correctamente: {}", ex.getMessage());
			throw new AssistantUnavailableException("DeepSeek no respondió correctamente", ex);
		}
	}

	private static String extractText(CompletionResponse response) {
		if (response == null || response.choices() == null || response.choices().isEmpty()) {
			throw new AssistantUnavailableException("DeepSeek devolvió una respuesta vacía");
		}
		Message message = response.choices().getFirst().message();
		if (message == null || message.content() == null || message.content().isBlank()) {
			throw new AssistantUnavailableException("DeepSeek devolvió una respuesta vacía");
		}
		return message.content().strip();
	}

	/** Un mensaje en el formato de la API: role = system | user | assistant. */
	public record Message(String role, String content) {
	}

	record CompletionRequest(
			String model,
			List<Message> messages,
			@JsonProperty("max_tokens") int maxTokens,
			double temperature,
			boolean stream) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record CompletionResponse(List<Choice> choices) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Choice(Message message) {
	}
}
