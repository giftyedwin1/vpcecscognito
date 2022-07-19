package com.example.demo;

import javax.servlet.Filter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.services.translate.AmazonTranslate;
import com.amazonaws.services.translate.AmazonTranslateClient;
import com.amazonaws.services.translate.model.TranslateTextRequest;
import com.amazonaws.services.translate.model.TranslateTextResult;
import com.amazonaws.services.translate.model.UnsupportedLanguagePairException;
import com.amazonaws.xray.javax.servlet.AWSXRayServletFilter;


@SpringBootApplication
@RestController
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@Bean
	public Filter TracingFilter() {
		return new AWSXRayServletFilter("XrayFilter");
	}
	
  @RequestMapping(value = "/", method = RequestMethod.GET, produces="application/json")
  public String home() {
	
	  AWSCredentialsProvider awsCreds = DefaultAWSCredentialsProviderChain.getInstance();
        
	  	AmazonTranslate translate = AmazonTranslateClient.builder()
            .withCredentials(new AWSStaticCredentialsProvider(awsCreds.getCredentials()))
            .withRegion("us-east-1")
                .build();
 
        TranslateTextRequest request = new TranslateTextRequest()
                .withText("Hello, world")
        .withSourceLanguageCode("en")
        .withTargetLanguageCode("es");
        TranslateTextResult result  = translate.translateText(request);  
        return result.toString();
  }
  
  @RequestMapping(value = "/translate", method = RequestMethod.POST, produces="application/json")
  public TranslateResponse translate(@RequestBody TranslateRequest request) {
	  
	  TranslateTextRequest translateRequest = new TranslateTextRequest()
              .withText(request.getTextToTranslate())
      .withSourceLanguageCode(request.getSource())
      .withTargetLanguageCode(request.getTarget());
	  
	  AWSCredentialsProvider awsCreds = DefaultAWSCredentialsProviderChain.getInstance();
	  
	  try {
		  AmazonTranslate translate = AmazonTranslateClient.builder()
		            .withCredentials(new AWSStaticCredentialsProvider(awsCreds.getCredentials()))
		            .withRegion("us-east-1")
		                .build();
		  TranslateTextResult result  = translate.translateText(translateRequest);
		  TranslateResponse translatedRes = new TranslateResponse();
		  translatedRes.setTranslatedText(result.getTranslatedText());
		  translatedRes.setSource(request.getSource());
		  translatedRes.setTarget(request.getTarget());
		  
		  
	      return translatedRes;
		} catch (UnsupportedLanguagePairException e) {
			TranslateResponse translatedRes = new TranslateResponse();
			translatedRes.setSource(request.getSource());
			translatedRes.setTarget(request.getTarget());
			translatedRes.setError(e.getErrorMessage());
			return translatedRes;
		}
  }
}
