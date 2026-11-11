package io.github.jhonhenryreyesperez.portfolio.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import io.github.jhonhenryreyesperez.portfolio.ratelimit.RateLimitInterceptor;

/** CORS para el portafolio y límite de peticiones en el endpoint del chat. */
@Configuration
@EnableConfigurationProperties(AssistantProperties.class)
public class WebConfig implements WebMvcConfigurer {

	private final AssistantProperties properties;
	private final RateLimitInterceptor rateLimitInterceptor;

	public WebConfig(AssistantProperties properties, RateLimitInterceptor rateLimitInterceptor) {
		this.properties = properties;
		this.rateLimitInterceptor = rateLimitInterceptor;
	}

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**")
				.allowedOrigins(properties.allowedOrigins().toArray(String[]::new))
				.allowedMethods("GET", "POST")
				.allowedHeaders("Content-Type")
				.maxAge(3600);
	}

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(rateLimitInterceptor).addPathPatterns("/api/chat");
	}
}
