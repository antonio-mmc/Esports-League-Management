package com.esports.league.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.esports.league")
@EnableJpaRepositories(basePackages = "com.esports.league.repository")
@EntityScan(basePackages = "com.esports.league.model")
public class ESportsLeagueApp {
    public static void main(String[] args) {
        SpringApplication.run(ESportsLeagueApp.class, args);
    }
}
