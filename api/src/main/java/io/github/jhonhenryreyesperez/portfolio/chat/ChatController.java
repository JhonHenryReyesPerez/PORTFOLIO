package io.github.jhonhenryreyesperez.portfolio.chat;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class ChatController {

	private final ChatService chatService;

	public ChatController(ChatService chatService) {
		this.chatService = chatService;
	}

	/** Responde la última pregunta del visitante teniendo en cuenta el historial reciente. */
	@PostMapping("/chat")
	public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
		return chatService.reply(request);
	}

	/** Sirve para comprobar que el servicio está arriba y para "despertarlo" al abrir el chat. */
	@GetMapping("/health")
	public Map<String, String> health() {
		return Map.of("status", "ok");
	}
}
