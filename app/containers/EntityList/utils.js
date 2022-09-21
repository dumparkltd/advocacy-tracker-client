import { Map, List } from 'immutable';

// work out actors for entities and store activites both direct as well as indirect
export const getActorsForEntities = ({
  actions,
  actors,
  subject = 'actors',
  includeIndirect = true,
  includeChildren = true,
}) => {
  const actionAtt = subject === 'actors'
    ? 'actors'
    : 'targets';
  const actionAttMembers = subject === 'actors'
    ? 'actorsMembers'
    : 'targetsMembers';
  const actionAttParents = subject === 'actors'
    ? 'actorsAssociations'
    : 'targetsAssociations';
  const actorAtt = subject === 'actors'
    ? 'actions'
    : 'targetingActions';
  const actorAttMembers = subject === 'actors'
    ? 'actionsMembers'
    : 'targetingActionsAsMember';
  const actorAttChildren = subject === 'actors'
    ? 'actionsAsParent'
    : 'targetingActionsAsParent';
  return actions && actions.reduce(
    (memo, action) => {
      const actionId = parseInt(action.get('id'), 10);
      const actionActors = action.get(actionAtt);
      let result = actionActors
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
              if (includeChildren
                && memo2.getIn([sActorId, actorAttChildren])
                && memo2.getIn([sActorId, actorAttChildren]).includes(actionId)
              ) {
                return memo2
                  .setIn([sActorId, actorAtt], List().push(actionId))
                  .setIn([sActorId, actorAttChildren], memo2.getIn([sActorId, actorAttChildren]).delete(actionId));
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
        result = actionActorsAsMember
          ? actionActorsAsMember.reduce(
            (memo2, actorId) => {
              const sActorId = actorId.toString();
              // makes sure not already included in direct or indirect action
              if (
                !memo2.getIn([sActorId, actorAtt])
                || !memo2.getIn([sActorId, actorAtt]).includes(actionId)
              ) {
                // if already present, add action id
                if (memo2.get(sActorId)) {
                  if (memo2.getIn([sActorId, actorAttMembers])) {
                    if (!memo2.getIn([sActorId, actorAttMembers]).includes(actionId)) {
                      return memo2.setIn(
                        [sActorId, actorAttMembers],
                        memo2.getIn([sActorId, actorAttMembers]).push(actionId),
                      );
                    }
                    return memo2;
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
            result,
          )
          : result;
      }
      if (includeChildren) {
        const actionActorsAsParent = action.get(actionAttParents);
        result = actionActorsAsParent
          ? actionActorsAsParent.reduce(
            (memo2, actorId) => {
              const sActorId = actorId.toString();
              // makes sure not already included in direct or indirect action
              if (
                !memo2.getIn([sActorId, actorAtt])
                || !memo2.getIn([sActorId, actorAtt]).includes(actionId)
              ) {
                // if already present, add action id
                if (memo2.get(sActorId)) {
                  if (memo2.getIn([sActorId, actorAttChildren])) {
                    if (!memo2.getIn([sActorId, actorAttChildren]).includes(actionId)) {
                      return memo2.setIn(
                        [sActorId, actorAttChildren],
                        memo2.getIn([sActorId, actorAttChildren]).push(actionId),
                      );
                    }
                    return memo2;
                  }
                  return memo2.setIn([sActorId, actorAttChildren], List().push(actionId));
                }
                const actor = actors.get(sActorId);
                return actor
                  ? memo2.set(sActorId, actor.set(actorAttChildren, List().push(actionId)))
                  : memo2;
              }
              return memo2;
            },
            result,
          )
          : result;
      }
      return result;
    },
    Map(),
  ).toList();
};

// work out actors for entities and store activites both direct as well as indirect
export const getUsersForEntities = (
  entities,
  users,
  type = 'entities',
) => {
  const userAtt = 'users';
  return entities && entities.reduce(
    (memo, entity) => {
      const entityId = parseInt(entity.get('id'), 10);
      const entityUsers = entity.get(userAtt);
      return entityUsers
        ? entityUsers.reduce(
          (memo2, userId) => {
            const sUserId = userId.toString();
            if (memo2.get(sUserId)) {
              if (memo2.getIn([sUserId, type])) {
                return memo2.setIn(
                  [sUserId, type],
                  memo2.getIn([sUserId, type]).push(entityId),
                );
              }
              // remove from indirect list if already added there
              return memo2.setIn([sUserId, type], List().push(entityId));
            }
            const user = users.get(sUserId);
            return user
              ? memo2.set(sUserId, user.set(type, List().push(entityId)))
              : memo2;
          },
          memo,
        )
        : memo;
    },
    Map(),
  ).toList();
};
