package com.aws.saas.ab.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.aws.saas.ab.entity.Order;
import com.aws.saas.ab.repository.OrderRepository;

@RestController
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/orders")
    public Order saveOrder(@RequestBody Order order) {
        return orderRepository.saveOrder(order);
    }

    @GetMapping("/orders/{id}")
    public Order getCustomerById(@PathVariable("id") String orderId) {
        return orderRepository.getOrderById(orderId);
    }

    @DeleteMapping("/orders/{id}")
    public String deleteCustomerById(@PathVariable("id") String orderId) {
        return  orderRepository.deleteOrderById(orderId);
    }

    @PutMapping("/orders/{id}")
    public String updateCustomer(@PathVariable("id") String orderId, @RequestBody Order order) {
        return orderRepository.updateOrder(orderId, order);
    }
}
