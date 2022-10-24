package com.creek.catering;

import java.util.Collections;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CateringApplication {

	public static void main(String[] args) {
		//SpringApplication.run(CateringApplication.class, args);
		SpringApplication app = new SpringApplication(CateringApplication.class);
        app.setDefaultProperties(Collections.singletonMap("server.port", "8083"));
        app.run(args);
	}

}
