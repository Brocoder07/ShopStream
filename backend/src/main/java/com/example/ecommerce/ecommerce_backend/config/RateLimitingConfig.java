package com.example.ecommerce.ecommerce_backend.config;

import java.time.Duration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.Refill;

@Configuration
public class RateLimitingConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor(bucket()));
    }

    @Bean
    public RateLimitInterceptor rateLimitInterceptor(Bucket bucket) {
        return new RateLimitInterceptor(bucket);
    }

    @Bean
    public Bucket bucket() {
        Bandwidth limit = Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1)));
        BucketConfiguration configuration = BucketConfiguration.builder()
                .addLimit(limit)
                .build();
        return Bucket.builder()
                .withNanosecondPrecision()
                .addLimit(limit)
                .build();
    }
}