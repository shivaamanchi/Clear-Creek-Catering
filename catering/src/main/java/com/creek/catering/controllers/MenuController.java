package com.creek.catering.controllers;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.creek.catering.modals.Meat;
import com.creek.catering.modals.SandWichWraps;
import com.google.api.core.ApiFuture;
import com.google.auth.*;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
// [START firestore_deps]
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
// [END firestore_deps]
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;
import com.google.firebase.cloud.FirestoreClient;

import com.google.common.collect.ImmutableMap;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.PostConstruct;

  
@RestController
@RequestMapping("/")
public class MenuController   
{  
	
	 private Firestore db;
	
public 	MenuController(){
		
		}

@PostConstruct
public void init() throws IOException {
	
	
	FileInputStream serviceAccount =
			  new FileInputStream("C:\\Users\\S545603\\Downloads\\serviceAccountKey.json");

			FirebaseOptions options = new FirebaseOptions.Builder()
			  .setCredentials(GoogleCredentials.fromStream(serviceAccount))
			  .setDatabaseUrl("https://clear-creek-catering-5948b-default-rtdb.firebaseio.com")
			  .build();

			FirebaseApp.initializeApp(options);
	
}
	
@RequestMapping("/")  
public String hello()   
{  
return "Hello User";  
}  

@RequestMapping("/allMenu")  
public HashMap<String, Object> retrieveAllDocuments() throws Exception {
	 Firestore db = FirestoreClient.getFirestore();
 
    ApiFuture<QuerySnapshot> query = db.collection("Sandwiches_Wraps").get();
 
    QuerySnapshot querySnapshot = query.get();
    List<QueryDocumentSnapshot> documents = querySnapshot.getDocuments();
    HashMap<String, Object> data = new HashMap<>();
    for (QueryDocumentSnapshot document : documents) {
 
      data.put(document.getId(), document.getData());
      
    }
 
	return data;
  }

@PostMapping(
        value = "/addMenu",
        params = {"name"},
        consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
		@ResponseBody
public ResponseEntity<String> addDocument(@RequestBody SandWichWraps items, @RequestParam("name") String name) throws Exception {

	   Firestore db = FirestoreClient.getFirestore();
        DocumentReference docRef = db.collection("Sandwiches_Wraps").document(name);
     
        Map<String, Object> data = new HashMap<>();
        data.put("avaialble", items.getAvailable());
     
        data.put("basePrice", items.getBasePrice());
        data.put("bread", items.getBread());
        data.put("description", items.getDescription());
        data.put("toppings", Arrays.asList(items.getToppings()));
        data.put("imagePath", items.getImagePath());
        data.put("todaySpecial", items.isTodaySpecial());
        
        
        ApiFuture<WriteResult> result = docRef.set(data);

        System.out.println("Update time : " + result.get().getUpdateTime());
        
        return ResponseEntity.ok("Menu Item "+ name + " Added Successfully")  ;

      }

@RequestMapping(
		  value = "/deleteMenu", 
		  params = { "wrapname" }, 
		  method = RequestMethod.GET)
		@ResponseBody
public ResponseEntity<String> deleteDocument(@RequestParam("wrapname") String wrapname) throws Exception {
	 Firestore db = FirestoreClient.getFirestore();
	ApiFuture<WriteResult> writeResult = db.collection("Sandwiches_Wraps").document(wrapname).delete();
  
	System.out.println("Update time : " + writeResult.get().getUpdateTime());
      return  ResponseEntity.ok("Menu Item Deleted Successfully");

    }




@RequestMapping("/allToppings")  
public HashMap<String, Object> allToppings() throws Exception {
	 Firestore db = FirestoreClient.getFirestore();
 
    ApiFuture<QuerySnapshot> query = db.collection("Toppings").get();
 
    QuerySnapshot querySnapshot = query.get();
    List<QueryDocumentSnapshot> documents = querySnapshot.getDocuments();
    HashMap<String, Object> data = new HashMap<>();
    for (QueryDocumentSnapshot document : documents) {
 
      data.put(document.getId(), document.getData());
      
    }
 
	return data;
  }


@RequestMapping("/allMeatOptions")  
public HashMap<String, Object> allMeatOptions() throws Exception {
	 Firestore db = FirestoreClient.getFirestore();
 
    ApiFuture<QuerySnapshot> query = db.collection("Meats").get();
 
    QuerySnapshot querySnapshot = query.get();
    List<QueryDocumentSnapshot> documents = querySnapshot.getDocuments();
    HashMap<String, Object> data = new HashMap<>();
    for (QueryDocumentSnapshot document : documents) {
 
      data.put(document.getId(), document.getData());
      
    }
 
	return data;
  }

@RequestMapping(
		 value = "/getMeatOption", 
		  params = {  "name" }, 
		  method = RequestMethod.GET)  
public Map<String, Object> addMeatOptions(@RequestParam("name") String name) throws Exception {
	 Firestore db = FirestoreClient.getFirestore();
 
	 DocumentReference docRef =  db.collection("Meats").document(name);
 


	 ApiFuture<DocumentSnapshot> result = docRef.get();
	 DocumentSnapshot doc = result.get();

 
	return doc.getData();
  }


@RequestMapping(
		 value = "/setMeatOption", 
		  params = {  "name", "item","price" }, 
		  method = RequestMethod.GET)  
public ResponseEntity<String> setMeatOptions(@RequestParam("name") String name, @RequestParam("item") String item,  @RequestParam("price") String price) throws Exception {
	 Firestore db = FirestoreClient.getFirestore();

	 DocumentReference docRef =  db.collection("Meats").document(name);
	 
	 ApiFuture<DocumentSnapshot> result = docRef.get();
	 DocumentSnapshot doc = result.get();
	 
	 Map<String, Object> dt = doc.getData();
	
	 
	 Meat mt = new Meat();
	 mt.setItem(item);
	 mt.setPrice(price);
	// it.
	
	 Map<String, Object> data = new HashMap<>();
	
	 if(dt== null) {
		 ArrayList<Meat> lit = new ArrayList<Meat>();
		 lit.add(mt);
		
		
//		 obj[0] = o;
		 data.put("items", lit);
		 docRef.set(data);
		   System.out.println("Update time : " + result.get().getUpdateTime());
	 }else {
		 
		 ArrayList<Meat> it = (ArrayList<Meat>) dt.get("items");
		 
		 it.add(mt);
		 
		 
		 System.out.print(data);
		 ApiFuture<WriteResult> resultt = docRef.set(dt);
		   System.out.println("Update time : " + resultt.get().getUpdateTime());
		 
	 }
	 // Map<String, Object> data = new HashMap<>();
	     
	   
	
	      
   


	return  ResponseEntity.ok("Meat option " + name + " added successfully");
 }


@RequestMapping(
		  value = "/addTopping", 
		  params = { "available","basePrice", "name" }, 
		  method = RequestMethod.GET)
		@ResponseBody
public ResponseEntity<String> addToppingDocument(@RequestParam("name") String name,
		@RequestParam("basePrice") String price, 
		@RequestParam("available") boolean available) throws Exception {

	   Firestore db = FirestoreClient.getFirestore();
      DocumentReference docRef = db.collection("Toppings").document(name);
   
      Map<String, Object> data = new HashMap<>();
     
   
      data.put("basePrice", price);
      data.put("available", available);
   
      ApiFuture<WriteResult> result = docRef.set(data);

      System.out.println("Update time : " + result.get().getUpdateTime());
      
      return ResponseEntity.ok("Topping Item "+ name + "Added Successfully");

    }

@RequestMapping(
		  value = "/deleteTopping", 
		  params = { "topping" }, 
		  method = RequestMethod.GET)
		@ResponseBody
public ResponseEntity<String> deleteToppingDocument(@RequestParam("topping") String topping) throws Exception {
	 Firestore db = FirestoreClient.getFirestore();
	ApiFuture<WriteResult> writeResult = db.collection("Toppings").document(topping).delete();

	System.out.println("Update time : " + writeResult.get().getUpdateTime());
    return ResponseEntity.ok("Topping Item Deleted Successfully");

  }


@RequestMapping(
		  value = "/deleteMeatOption", 
		  params = { "wrap","item" }, 
		  method = RequestMethod.GET)
		@ResponseBody
public ResponseEntity<String> deleteMeatDocument(@RequestParam("wrap") String wrap, @RequestParam("item") String item) throws Exception {
	 Firestore db = FirestoreClient.getFirestore();
 DocumentReference docRef =  db.collection("Meats").document(wrap);
	 
	 ApiFuture<DocumentSnapshot> result = docRef.get();
	 DocumentSnapshot doc = result.get();
	 
	 Map<String, Object> dt = doc.getData();
	 
	 
	 ArrayList<Object> it = (ArrayList<Object>) doc.get("items");
	
	 for (int i = 0; i < it.size(); i++) {
		 HashMap<String, String> m =  (HashMap<String, String>)it.get(i);
		 if(m.get("item").equals(item)) {
			 it.remove(i);
			 break;
		 }
	 }
	 dt.put("items", it);
	 
	 ApiFuture<WriteResult> result1 = docRef.set(dt);
	   System.out.println("Update time : " + result1.get().getUpdateTime());
    return ResponseEntity.ok("Meat Item Deleted Successfully");

  }


@RequestMapping(
		  value = "/setTruckLocation", 
		  params = { "address","lat", "lng", "startTime", "endTime","url" }, 
		  method = RequestMethod.GET)
		@ResponseBody
public ResponseEntity<String> truckLocation(@RequestParam("address") String address,
		@RequestParam("lat") String lat, 
		@RequestParam("lng") String lng, @RequestParam("startTime") String startTime , @RequestParam("endTime") String endTime,@RequestParam("url") String url) throws Exception {

	   Firestore db = FirestoreClient.getFirestore();
    DocumentReference docRef = db.collection("truck_location").document("location");
 
    Map<String, Object> data = new HashMap<>();
   
 
    data.put("address", address);
    data.put("lat", lat);
    data.put("lng", lng);
    data.put("startTime", startTime);
    data.put("endTime", endTime);
    data.put("url", url);
 
    ApiFuture<WriteResult> result = docRef.set(data);

    System.out.println("Update time : " + result.get().getUpdateTime());
    
    return ResponseEntity.ok("Truck location  "+ address + " added successfully");

  }
    
@RequestMapping(
		 value = "/getTruckLocation", 
		
		  method = RequestMethod.GET)  
public Map<String, Object> getTruckLocation() throws Exception {
	 Firestore db = FirestoreClient.getFirestore();

	 DocumentReference docRef =  db.collection("truck_location").document("location");



	 ApiFuture<DocumentSnapshot> result = docRef.get();
	 DocumentSnapshot doc = result.get();


	return doc.getData();
 }

      
    
}  
