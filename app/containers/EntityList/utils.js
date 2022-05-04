import { Map, List } from 'immutable';

// work out actors for entities and store activites both direct as well as indirect
export const getActorsForEntities = (
  actions,
  actors,
  subject = 'actors',
  includeIndirect = true,
) => {
  const actionAtt = subject === 'actors'
    ? 'actors'
    : 'targets';
  const actionAttMembers = subject === 'actors'
    ? 'actorsMembers'
    : 'targetsMembers';
  const actorAtt = subject === 'actors'
    ? 'actions'
    : 'targetingActions';
  const actorAttMembers = subject === 'actors'
    ? 'actionsMembers'
    : 'targetingActionsAsMember';
  return actions && actions.reduce(
    (memo, action) => {
      const actionId = parseInt(action.get('id'), 10);
      const actionActors = action.get(actionAtt);
      const memoDirect = actionActors
        ? actionActors.reduce(
          (memo2, actorId) => {
            const sActorId = actorId.toString();
            if (memo2.get(sActorId)) {
              if (memo2.getIn([sActorId, actorAtt])) {
                return memo2.setIn(
                  [sActorId, actorAtt],
                  memo2.getIn([sActorId, actorAtt]).push(actionId),
                );
              }
              // remove from indirect list if already added there
              if (includeIndirect
                && memo2.getIn([sActorId, actorAttMembers])
                && memo2.getIn([sActorId, actorAttMembers]).includes(actionId)
              ) {
                return memo2
                  .setIn([sActorId, actorAtt], List().push(actionId))
                  .setIn([sActorId, actorAttMembers], memo2.getIn([sActorId, actorAttMembers]).delete(actionId));
              }
              return memo2.setIn([sActorId, actorAtt], List().push(actionId));
            }
            const actor = actors.get(sActorId);
            return actor
              ? memo2.set(sActorId, actor.set(actorAtt, List().push(actionId)))
              : memo2;
          },
          memo,
        )
        : memo;
      if (includeIndirect) {
        const actionActorsAsMember = action.get(actionAttMembers);
        return actionActorsAsMember
          ? actionActorsAsMember.reduce(
            (memo2, actorId) => {
              const sActorId = actorId.toString();
              // makes sure not already included in direct action
              if (
                !memo2.getIn([sActorId, actorAtt])
                || !memo2.getIn([sActorId, actorAtt]).includes(actionId)
              ) {
                // if already present, add action id
                if (memo2.get(sActorId)) {
                  if (memo2.getIn([sActorId, actorAttMembers])) {
                    return memo2.setIn(
                      [sActorId, actorAttMembers],
                      memo2.getIn([sActorId, actorAttMembers]).push(actionId),
                    );
                  }
                  return memo2.setIn([sActorId, actorAttMembers], List().push(actionId));
                }
                const actor = actors.get(sActorId);
                return actor
                  ? memo2.set(sActorId, actor.set(actorAttMembers, List().push(actionId)))
                  : memo2;
              }
              return memo2;
            },
            memoDirect,
          )
          : memoDirect;
      }
      return memoDirect;
    },
    Map(),
  ).toList();
};
