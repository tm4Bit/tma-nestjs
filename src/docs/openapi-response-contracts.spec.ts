import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppController } from '../app.controller';
import { AppRepository } from '../app.repository';
import { AppService } from '../app.service';
import { BlogPostsController } from '../blog-posts/blog-posts.controller';
import { BlogPostsRepository } from '../blog-posts/blog-posts.repository';
import { BlogPostsService } from '../blog-posts/blog-posts.service';
import { configureHttpApp } from '../bootstrap/configure-http-app';

describe('OpenAPI response contracts', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController, BlogPostsController],
      providers: [
        AppService,
        BlogPostsService,
        {
          provide: AppRepository,
          useValue: {
            getDatabaseVersion: jest.fn().mockResolvedValue('test-db'),
          },
        },
        {
          provide: BlogPostsRepository,
          useValue: {
            create: jest.fn(),
            list: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            publish: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureHttpApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('documents zod response contracts for app and blog-posts endpoints', () => {
    const config = new DocumentBuilder()
      .setTitle('Test API')
      .setVersion('1.0.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    const getResponseSchema = (
      operation: Record<string, unknown> | undefined,
      status: string,
    ) => {
      const responses = operation?.responses as
        | Record<string, unknown>
        | undefined;
      const statusResponse = responses?.[status] as
        | Record<string, unknown>
        | undefined;
      const content = statusResponse?.content as
        | Record<string, unknown>
        | undefined;
      const jsonContent = content?.['application/json'] as
        | Record<string, unknown>
        | undefined;

      return jsonContent?.schema;
    };

    const rootGet = document.paths['/']?.get;
    expect(rootGet?.summary).toBe('Check API health status');
    expect(
      getResponseSchema(rootGet as unknown as Record<string, unknown>, '200'),
    ).toBeDefined();

    const createBlogPost = document.paths['/blog-posts']?.post;
    expect(createBlogPost?.summary).toBe('Create a blog post');
    expect(
      getResponseSchema(
        createBlogPost as unknown as Record<string, unknown>,
        '201',
      ),
    ).toBeDefined();

    const listBlogPosts = document.paths['/blog-posts']?.get;
    expect(listBlogPosts?.summary).toBe('List blog posts');
    expect(
      getResponseSchema(
        listBlogPosts as unknown as Record<string, unknown>,
        '200',
      ),
    ).toBeDefined();

    const getBlogPost = document.paths['/blog-posts/{id}']?.get;
    expect(getBlogPost?.summary).toBe('Get blog post by id');
    expect(
      getResponseSchema(
        getBlogPost as unknown as Record<string, unknown>,
        '200',
      ),
    ).toBeDefined();
  });
});
