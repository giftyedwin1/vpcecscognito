package com.aws.saas.ab;

import java.io.Serializable;

public class TranslateRequest implements Serializable {
	
	private static final long serialVersionUID = -6766136496757944976L;
	private String source;
	private String target;
	private String textToTranslate;
	private String translatedText;
	
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
	public String getTextToTranslate() {
		return textToTranslate;
	}
	public void setTextToTranslate(String textToTranslate) {
		this.textToTranslate = textToTranslate;
	}
	public String getTranslatedText() {
		return translatedText;
	}
	public void setTranslatedText(String translatedText) {
		this.translatedText = translatedText;
	}
	
}
