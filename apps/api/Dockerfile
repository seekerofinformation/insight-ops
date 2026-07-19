FROM node:22-alpine AS api-deps
WORKDIR /app
COPY apps/api/package.json apps/api/package-lock.json ./apps/api/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/fixtures/package.json ./packages/fixtures/
RUN cd apps/api && npm ci --workspaces=false

FROM api-deps AS builder
COPY apps/api ./apps/api
COPY packages/contracts ./packages/contracts
COPY packages/fixtures ./packages/fixtures
RUN ./apps/api/node_modules/.bin/tsc --project packages/contracts/tsconfig.build.json
RUN ./apps/api/node_modules/.bin/tsc --project packages/fixtures/tsconfig.build.json
RUN cd apps/api && npm run prisma:generate && npm run build

FROM node:22-alpine AS production-deps
WORKDIR /app
COPY apps/api/package.json apps/api/package-lock.json ./apps/api/
COPY packages/contracts/package.json ./packages/contracts/
RUN cd apps/api \
    && npm ci --omit=dev --omit=peer --omit=optional --ignore-scripts --workspaces=false \
    && unlink node_modules/@insightops/contracts

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
ENV HOME=/tmp
WORKDIR /app/apps/api

RUN addgroup -S -g 10001 api && adduser -S -D -H -u 10001 -G api api

COPY --from=production-deps --chown=api:api /app/apps/api/node_modules ./node_modules
COPY --from=builder --chown=api:api /app/apps/api/dist ./dist
COPY --from=builder --chown=api:api /app/apps/api/package.json ./package.json
COPY --from=builder --chown=api:api /app/packages/contracts/package.json ./node_modules/@insightops/contracts/package.json
COPY --from=builder --chown=api:api /app/packages/contracts/dist ./node_modules/@insightops/contracts/dist

USER 10001:10001
EXPOSE 4000
CMD ["node", "dist/server.js"]

FROM node:22-alpine AS migration
ENV NODE_ENV=production
ENV HOME=/tmp
WORKDIR /app/apps/api

RUN addgroup -S -g 10001 api && adduser -S -D -H -u 10001 -G api api

COPY --from=api-deps --chown=api:api /app/apps/api/node_modules ./node_modules
COPY --from=builder --chown=api:api /app/apps/api/package.json ./package.json
COPY --from=builder --chown=api:api /app/apps/api/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=builder --chown=api:api /app/apps/api/prisma/migrations ./prisma/migrations
COPY --from=builder --chown=api:api /app/apps/api/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=api:api /app/apps/api/scripts ./scripts
COPY --from=builder --chown=api:api /app/packages/contracts/package.json /app/packages/contracts/package.json
COPY --from=builder --chown=api:api /app/packages/contracts/dist /app/packages/contracts/dist

USER 10001:10001
CMD ["npm", "run", "prisma:deploy:with-grants"]
