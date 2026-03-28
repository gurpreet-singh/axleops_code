package com.fleetmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = { UserDetailsServiceAutoConfiguration.class })
public class AxleOpsApplication {

    public static void main(String[] args) {
        SpringApplication.run(AxleOpsApplication.class, args);
    }
}
