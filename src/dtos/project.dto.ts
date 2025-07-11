// dtos/project.dto.ts
import { ValidateNested, IsString, IsBoolean, IsEnum ,IsDateString, IsOptional, IsArray } from 'class-validator';
import { ProjectStatus } from '@prisma/client';
import { Type } from 'class-transformer';


class SkillForm {
  @IsArray()
  generalSkills: string[] = [];

  @IsArray()
  customSkills: string[] = [];
}

export class CreateProjectDto {
  @IsString()
  projectName!: string;

  @IsOptional()
  @IsString()
  projectDesc?: string;

  @IsBoolean()
  isPublic!: boolean;

  @IsEnum(ProjectStatus)
  status!: ProjectStatus;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate?: string;

  @IsString()
  role!: string;

  @ValidateNested()
  @Type(() => SkillForm)
  skill: SkillForm = {generalSkills:[], customSkills:[]};

  @IsArray()
  tags!: string[];
}

export class UpdateProjectDto extends CreateProjectDto {}
