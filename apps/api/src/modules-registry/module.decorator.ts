import { SetMetadata } from '@nestjs/common';

export const REQUIRED_MODULE_KEY = 'requiredModule';

export const Module = (moduleId: string) => SetMetadata(REQUIRED_MODULE_KEY, moduleId);
