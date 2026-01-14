package com.watchparty.websocket;

import lombok.Data;

@Data
public class ChatMessage {
    private String sender;
    private String content;
    private long timestamp;

    // getters & setters
}
