package com.github.rodis00.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * Serves the built React app from classpath:/static. Addresses that are not a file
 * (e.g. /analysis) get index.html, so the client-side router can handle them.
 */
@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    private static final String API_PREFIX = "expense-tracker/";

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // built files carry a hash in their name
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).immutable());

        // index.html, sw.js and manifest must always be revalidated, otherwise updates get stuck
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.noCache())
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        if (resourcePath.startsWith(API_PREFIX)) {
                            return null;
                        }
                        Resource requested = location.createRelative(resourcePath);
                        return requested.exists() && requested.isReadable()
                                ? requested
                                : new ClassPathResource("static/index.html");
                    }
                });
    }
}
