package com.creek.catering.modals;

public class SandWichWraps {
	
	private boolean available;
	private int basePrice;
	private String bread;
	private String description;
	private String[] toppings;
	private String imagePath;
	private boolean todaySpecial;
	
	public boolean isTodaySpecial() {
		return todaySpecial;
	}

	public void setTodaySpecial(boolean todaySpecial) {
		this.todaySpecial = todaySpecial;
	}

	public String getImagePath() {
		return imagePath;
	}

	public void setImagePath(String imagePath) {
		this.imagePath = imagePath;
	}

	public void setAvailable(boolean avl) {
			this.available = avl;
	}
	
	public boolean getAvailable() {
		return this.available;
	}

	public int getBasePrice() {
		return basePrice;
	}

	public void setBasePrice(int basePrice) {
		this.basePrice = basePrice;
	}

	public String getBread() {
		return bread;
	}

	public void setBread(String bread) {
		this.bread = bread;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String[] getToppings() {
		return toppings;
	}

	public void setToppings(String[] toppings) {
		this.toppings = toppings;
	}
	
	

}
