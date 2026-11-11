package io.github.jhonhenryreyesperez.portfolio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * API del asistente del portafolio: recibe las preguntas del chat y las
 * responde con DeepSeek usando solo los datos públicos del portafolio.
 */
@SpringBootApplication
public class PortfolioApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(PortfolioApiApplication.class, args);
	}

}
