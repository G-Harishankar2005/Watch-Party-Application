package com.watchparty.service;

import com.watchparty.websocket.WatchEvent;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RoomStateStore {

    private final Map<String, WatchEvent> roomStates = new ConcurrentHashMap<>();

    public void update(String roomCode, WatchEvent event) {
        roomStates.put(roomCode, event);
    }

    public WatchEvent get(String roomCode) {
        return roomStates.get(roomCode);
    }
}
