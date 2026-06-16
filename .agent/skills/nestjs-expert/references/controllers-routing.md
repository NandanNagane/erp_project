# Controllers & Routing

## Nested Routes

```typescript
@Controller("posts/:postId/comments")
@ApiTags("comments")
export class CommentsController {
  @Get()
  findAll(@Param("postId", ParseUUIDPipe) postId: string) {
    return this.commentsService.findByPost(postId);
  }

  @Post()
  create(
    @Param("postId", ParseUUIDPipe) postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(postId, dto);
  }
}
```

## Global Prefix & Versioning

```typescript
// main.ts
const app = await NestFactory.create(AppModule);
app.setGlobalPrefix("api");
app.enableVersioning({ type: VersioningType.URI });

// controller.ts
@Controller({ path: "users", version: "1" }) // /api/v1/users
export class UsersV1Controller {}

@Controller({ path: "users", version: "2" }) // /api/v2/users
export class UsersV2Controller {}
```

## Quick Reference

| Decorator             | Purpose              |
| --------------------- | -------------------- |
| `@Controller('path')` | Define route prefix  |
| `@Get()`, `@Post()`   | HTTP method          |
| `@Param('name')`      | Path parameter       |
| `@Query('name')`      | Query parameter      |
| `@Body()`             | Request body         |
| `@HttpCode(201)`      | Override status code |
| `@ApiTags()`          | Swagger grouping     |
| `@ApiOperation()`     | Endpoint description |
| `@ApiResponse()`      | Document response    |
