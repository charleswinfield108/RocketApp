package com.rocketFoodDelivery.rocketFood.controller.api;

import com.rocketFoodDelivery.rocketFood.dtos.restaurant.ApiCreateRestaurantDTO;
import com.rocketFoodDelivery.rocketFood.dtos.restaurant.ApiRestaurantDTO;
import com.rocketFoodDelivery.rocketFood.dtos.product.ApiProductDTO;
import com.rocketFoodDelivery.rocketFood.exception.*;
import com.rocketFoodDelivery.rocketFood.service.RestaurantService;
import com.rocketFoodDelivery.rocketFood.service.ProductService;
import com.rocketFoodDelivery.rocketFood.util.ResponseBuilder;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1")
public class RestaurantApiController {
    private final RestaurantService restaurantService;
    private final ProductService productService;

    public RestaurantApiController(RestaurantService restaurantService, ProductService productService) {
        this.restaurantService = restaurantService;
        this.productService = productService;
    }

    @PostMapping("/restaurants")
    public ResponseEntity<Object> createRestaurant(@Valid @RequestBody ApiCreateRestaurantDTO restaurant, BindingResult result) {
        if (result.hasErrors()) throw new ValidationException(result);
        Optional<ApiCreateRestaurantDTO> created = restaurantService.createRestaurant(restaurant);
        if (created.isEmpty()) throw new BadRequestException("Address is required");
        return ResponseBuilder.buildCreatedResponse(created.get());
    }

    @DeleteMapping("/restaurants/{id}")
    public ResponseEntity<Object> deleteRestaurant(@PathVariable int id) {
        if (!restaurantService.deleteRestaurantIfExists(id))
            throw new ResourceNotFoundException(String.format("Restaurant with id %d not found", id));
        return ResponseBuilder.buildOkResponse(null);
    }

    @PutMapping("/restaurants/{id}")
    public ResponseEntity<Object> updateRestaurant(@PathVariable("id") int id, @Valid @RequestBody ApiCreateRestaurantDTO restaurantUpdateData, BindingResult result) {
        if (result.hasErrors()) throw new ValidationException(result);
        Optional<ApiCreateRestaurantDTO> updated = restaurantService.updateRestaurant(id, restaurantUpdateData);
        if (updated.isEmpty()) throw new ResourceNotFoundException(String.format("Restaurant with id %d not found", id));
        return ResponseBuilder.buildOkResponse(updated.get());
    }

    @GetMapping("/restaurants/{id}")
    public ResponseEntity<Object> getRestaurantById(@PathVariable int id) {
        Optional<ApiRestaurantDTO> dto = restaurantService.getRestaurantWithRating(id);
        if (dto.isEmpty()) throw new ResourceNotFoundException(String.format("Restaurant with id %d not found", id));
        return ResponseBuilder.buildOkResponse(dto.get());
    }

    @GetMapping("/restaurants")
    public ResponseEntity<Object> getAllRestaurants(
            @RequestParam(name = "rating", required = false) Integer rating,
            @RequestParam(name = "price_range", required = false) Integer priceRange) {
        List<ApiRestaurantDTO> dtos = restaurantService.getRestaurantsByRatingAndPriceRange(rating, priceRange);
        return ResponseBuilder.buildOkResponse(dtos);
    }

    @GetMapping("/restaurants/{id}/menu")
    public ResponseEntity<Object> getRestaurantMenu(@PathVariable int id) {
        // Verify restaurant exists
        Optional<ApiRestaurantDTO> restaurant = restaurantService.getRestaurantWithRating(id);
        if (restaurant.isEmpty()) throw new ResourceNotFoundException(String.format("Restaurant with id %d not found", id));
        
        // Get menu items for this restaurant
        List<ApiProductDTO> menuItems = productService.getProductDTOs(id);
        return ResponseBuilder.buildOkResponse(menuItems);
    }

    @GetMapping("/restaurants/{id}/items")
    public ResponseEntity<Object> getRestaurantItems(@PathVariable int id) {
        // Verify restaurant exists
        Optional<ApiRestaurantDTO> restaurant = restaurantService.getRestaurantWithRating(id);
        if (restaurant.isEmpty()) throw new ResourceNotFoundException(String.format("Restaurant with id %d not found", id));
        
        // Get menu items for this restaurant
        List<ApiProductDTO> menuItems = productService.getProductDTOs(id);
        return ResponseBuilder.buildOkResponse(menuItems);
    }
}
