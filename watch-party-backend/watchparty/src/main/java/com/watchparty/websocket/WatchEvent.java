package com.watchparty.websocket;

import lombok.Data;

@Data
public class WatchEvent {
    private String action;
    private double timestamp;
    private String videoId;
    }

