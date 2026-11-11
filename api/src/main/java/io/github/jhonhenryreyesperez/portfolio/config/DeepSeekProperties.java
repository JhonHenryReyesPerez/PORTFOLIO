package io.github.jhonhenryreyesperez.portfolio.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Conexión con la API de DeepSeek (compatible con el formato de OpenAI).
 * La clave llega por la variable de entorno DEEPSEEK_API_KEY y nunca se versiona.
 */
@ConfigurationProperties("deepseek")
public record DeepSeekProperties(
		String apiKey,
		String baseUrl,
		String model,
		int maxTokens,
		double temperature,
		Duration timeout) {

	public boolean isConfigured() {
		return apiKey != null && !apiKey.isBlank();
	}
}
