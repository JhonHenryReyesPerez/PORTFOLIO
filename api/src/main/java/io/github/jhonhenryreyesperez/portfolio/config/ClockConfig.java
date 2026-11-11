package io.github.jhonhenryreyesperez.portfolio.config;

import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Reloj inyectable: permite probar los límites de tiempo sin esperar de verdad. */
@Configuration
public class ClockConfig {

	@Bean
	Clock clock() {
		return Clock.systemUTC();
	}
}
