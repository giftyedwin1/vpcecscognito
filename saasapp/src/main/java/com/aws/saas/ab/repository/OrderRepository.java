package com.aws.saas.ab.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBSaveExpression;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.ExpectedAttributeValue;
import com.aws.saas.ab.entity.Order;

@Repository
public class OrderRepository {

	@Autowired
    private DynamoDBMapper dynamoDBMapper;

    public Order saveOrder(Order order) {
        dynamoDBMapper.save(order);
        return order;
    }

    public Order getOrderById(String orderId) {
        return dynamoDBMapper.load(Order.class, orderId);
    }

    public String deleteOrderById(String orderId) {
        dynamoDBMapper.delete(dynamoDBMapper.load(Order.class, orderId));
        return "Order Id : "+ orderId +" Deleted!";
    }

    public String updateOrder(String orderId, Order order) {
        dynamoDBMapper.save(order,
                new DynamoDBSaveExpression()
        .withExpectedEntry("orderId",
                new ExpectedAttributeValue(
                        new AttributeValue().withS(orderId)
                )));
        return orderId;
    }
	
}
