package com.example.demo;

import java.io.Serializable;

public class TranslateResponse implements Serializable {

	private static final long serialVersionUID = -5518753169347505555L;
	private String translatedText;
	private String source;
	private String target;
	private String error;
	
	public String getTranslatedText() {
		return translatedText;
	}
	public void setTranslatedText(String translatedText) {
		this.translatedText = translatedText;
	}
	public String getSource() {
		return source;
	}
	public void setSource(String source) {
		this.source = source;
	}
	public String getTarget() {
		return target;
	}
	public void setTarget(String target) {
		this.target = target;
	}
	public String getError() {
		return error;
	}
	public void setError(String error) {
		this.error = error;
	}
	
	
}
