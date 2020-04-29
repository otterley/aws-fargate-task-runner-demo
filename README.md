# Amazon ECS Fargate Demo - SQS-driven Task Processor

This CDK application demonstrates an Amazon ECS/Fargate-based task processor
that receives jobs from an SQS queue. Unlike most container-based solutions,
this example runs a container per message received. It is particularly useful
for highly concurrent ("embarrassingly parallel") workloads that can scale
horizontally.

To deploy this example, you'll need the AWS Cloud Development Kit, or CDK.

## Prerequisites

You will need:

* An Amazon Web Services account with valid credentials
* Node.js installed on your computer

## Installation instructions

```sh
$ npm install
$ npm run cdk deploy
```

## Theory of Operations

The producer produces messages into an SQS queue for consumption.

A Lambda function called `startMachine` receives the records (messages) in a
batch (up to 10). For each record, a Step Function (state machine) is executed.

The Step Function execution launches an ECS Fargate task, providing the body of
the record in the primary container's `BODY` environment variable. The container
performs whatever processing needs to be done.

If the container exits successfully, the Step Function terminates successfully.

If the container does not exit successfully, the Step Function requeues the body
of the record into a dead-letter queue. This message may be reused for
subsequent reprocessing.

## Costs

If you run this solution, you will incur standard AWS charges. See the AWS
pricing details for each service for more information.

## Limits

Services including SQS, Step Functions, ECS, and Fargate are subject to
various rate limits. The behavior of this solution upon encountering such
rate limits has not yet been fully tested.

## License

This software is licensed under the Apache 2.0 license.
