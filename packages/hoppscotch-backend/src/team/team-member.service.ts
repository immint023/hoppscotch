import { Injectable } from '@nestjs/common';
import { TeamMember, TeamMemberRole, Team } from './team.model';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { TEAMS_NOT_FOUND } from 'src/errors';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TeamMemberService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsersInTeam(teamName: string): Promise<TeamMember[]> {
    const team = await this.prisma.team.findFirst({
      where: {
        name: teamName,
      },
      include: {
        members: true,
      },
    });
    if (O.isNone(O.some(team))) {
      throw E.left(TEAMS_NOT_FOUND);
    }

    const teamMembers = team.members;
    if (O.isNone(O.some(teamMembers))) {
      throw E.left(TEAMS_NOT_FOUND);
    }

    return teamMembers.map(
      (entry) =>
        <TeamMember>{
          membershipID: entry.id,
          userUid: entry.userUid,
          role: TeamMemberRole[entry.role],
        },
    );
  }
}
