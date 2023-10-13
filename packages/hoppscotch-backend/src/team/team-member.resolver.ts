import { Resolver, ResolveField, Parent, Args, Query } from '@nestjs/graphql';
import { TeamMember } from './team.model';
import { UserService } from 'src/user/user.service';
import { User } from '../user/user.model';
import { throwErr } from 'src/utils';
import { USER_NOT_FOUND } from 'src/errors';
import * as O from 'fp-ts/Option';
import { TeamMemberService } from './team-member.service';

@Resolver(() => TeamMember)
export class TeamMemberResolver {
  constructor(
    private readonly userService: UserService,
    private readonly teamMemberService: TeamMemberService,
  ) {}

  @Query(() => [TeamMember])
  async usersInTeam(
    @Args({
      name: 'teamName',
      type: () => String,
    })
    teamName: string,
  ): Promise<TeamMember[]> {
    return this.teamMemberService.getUsersInTeam(teamName);
  }

  @ResolveField(() => User)
  async user(@Parent() teamMember: TeamMember): Promise<User> {
    const member = await this.userService.findUserById(teamMember.userUid);
    if (O.isNone(member)) throwErr(USER_NOT_FOUND);

    return {
      ...member.value,
      currentRESTSession: JSON.stringify(member.value.currentRESTSession),
      currentGQLSession: JSON.stringify(member.value.currentGQLSession),
    };
  }
}
