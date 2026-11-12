package io.github.jhonhenryreyesperez.portfolio.chat;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.util.List;

import org.junit.jupiter.api.Test;

import io.github.jhonhenryreyesperez.portfolio.config.AssistantProperties;
import io.github.jhonhenryreyesperez.portfolio.config.AssistantProperties.Limit;
import tools.jackson.databind.json.JsonMapper;

class KnowledgeBaseTest {

	private static final String SITE = "https://example.github.io/PORTFOLIO/";

	private final KnowledgeBase knowledgeBase = new KnowledgeBase(
			JsonMapper.builder().build(),
			new AssistantProperties(SITE, List.of(), 8,
					new Limit(1, Duration.ofMinutes(1)), new Limit(1, Duration.ofDays(1))));

	@Test
	void includesThePortfolioData() {
		assertThat(knowledgeBase.systemPrompt())
				.contains("Jhon Reyes")
				.contains("CampusDesk")
				.contains("Spring Boot")
				.contains("jhonrysprzhh@gmail.com");
	}

	@Test
	void leavesOutFieldsThatOnlyDrawThePage() {
		assertThat(knowledgeBase.systemPrompt())
				.doesNotContain("\"visual\"")
				.doesNotContain("\"tint\"")
				.doesNotContain("\"icon\"");
	}

	@Test
	void keepsToolContextSoTheModelDoesNotGuessTheProject() {
		assertThat(knowledgeBase.systemPrompt())
				.contains("\"context\"")
				.contains("proyecto privado")
				.contains("solo si aparece en el \"stack\" de ese proyecto");
	}

	@Test
	void tellsTheModelWhereRelativeLinksLive() {
		assertThat(knowledgeBase.systemPrompt()).contains(SITE);
	}
}
