import { Controller, Get, Param, UseGuards, Res, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PDFService } from './pdf.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { UserRole } from '../../common/enums/user.enums';
import { Response } from 'express';
import { ProjectsService } from '../projects/projects.service';

@ApiTags('pdf')
@ApiBearerAuth()
@Controller('pdf')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PDFController {
  constructor(
    private pdfService: PDFService,
    private projectsService: ProjectsService,
  ) {}

  @Get('projects/:id')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Gerar PDF do projeto' })
  @ApiResponse({ status: 200, description: 'PDF gerado' })
  async generateProjectPdf(
    @Param('id') id: string,
    @Res() res: Response,
    @CurrentUser() user: User,
  ) {
    const project = await this.projectsService.findById(id, user);
    const pdfBuffer = await this.pdfService.generateProjectPdf(project);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="projeto-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }
}