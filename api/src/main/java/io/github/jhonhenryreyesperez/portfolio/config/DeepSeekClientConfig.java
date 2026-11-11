package io.github.jhonhenryreyesperez.portfolio.config;

import java.net.http.HttpClient;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/** Cliente HTTP hacia DeepSeek con tiempos de espera acotados. */
@Configuration
@EnableConfigurationProperties(DeepSeekProperties.class)
public class DeepSeekClientConfig {

	@Bean
	RestClient.Builder deepSeekRestClientBuilder(DeepSeekProperties properties) {
		HttpClient httpClient = HttpClient.newBuilder()
				.connectTimeout(properties.timeout())
				.build();
		JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
		requestFactory.setReadTimeout(properties.timeout());

		return RestClient.builder()
				.baseUrl(properties.baseUrl())
				.requestFactory(requestFactory);
	}
}
