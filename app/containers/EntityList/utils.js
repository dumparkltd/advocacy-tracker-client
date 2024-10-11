import { Map, List } from 'immutable';

// work out actors for entities and store activites both direct as well as indirect
export const getActorsForEntities = ({
  actions,
  actors,
  includeIndirect = true,
  includeChildren = true,
}) => {
  console.log('getActorsForEntities');
  return actions && actions.reduce(
    (memo, action) => {
      const actionId = parseInt(action.get('id'), 10);
      const actorsForAction = action.get('actors');
      let result = actorsForAction
        ? actorsForAction.reduce(
          (memo2, actorId) => {
            const sActorId = actorId.toString();
            if (memo2.get(sActorId)) {
              if (memo2.getIn([sActorId, 'actions'])) {
                return memo2.setIn(
                  [sActorId, 'actions'],
                  memo2.getIn([sActorId, 'actions']).push(actionId),
                );
              }
              // remove from indirect list if already added there
              if (includeIndirect
                && memo2.getIn([sActorId, 'actionsMembers'])
                && memo2.getIn([sActorId, 'actionsMembers']).includes(actionId)
              ) {
                return memo2
                  .setIn([sActorId, 'actions'], List().push(actionId))
                  .setIn([sActorId, 'actionsMembers'], memo2.getIn([sActorId, 'actionsMembers']).delete(actionId));
              }
              if (includeChildren
                && memo2.getIn([sActorId, 'actionsAsParent'])
                && memo2.getIn([sActorId, 'actionsAsParent']).includes(actionId)
              ) {
                return memo2
                  .setIn([sActorId, 'actions'], List().push(actionId))
                  .setIn([sActorId, 'actionsAsParent'], memo2.getIn([sActorId, 'actionsAsParent']).delete(actionId));
              }
              return memo2.setIn([sActorId, 'actions'], List().push(actionId));
            }
            const actor = actors.get(sActorId);
            return actor
              ? memo2.set(sActorId, actor.set('actions', List().push(actionId)))
              : memo2;
          },
          memo,
        )
        : memo;
      if (includeIndirect) {
        const actorsAsMemberForAction = action.get('actorsMembers');
        result = actorsAsMemberForAction
          ? actorsAsMemberForAction.reduce(
            (memo2, actorId) => {
              const sActorId = actorId.toString();
              // makes sure not already included in direct or indirect action
              if (
                !memo2.getIn([sActorId, 'actions'])
                || !memo2.getIn([sActorId, 'actions']).includes(actionId)
              ) {
                // if already present, add action id
                if (memo2.get(sActorId)) {
                  if (memo2.getIn([sActorId, 'actionsMembers'])) {
                    if (!memo2.getIn([sActorId, 'actionsMembers']).includes(actionId)) {
                      return memo2.setIn(
                        [sActorId, 'actionsMembers'],
                        memo2.getIn([sActorId, 'actionsMembers']).push(actionId),
                      );
                    }
                    return memo2;
                  }
                  return memo2.setIn([sActorId, 'actionsMembers'], List().push(actionId));
                }
                const actor = actors.get(sActorId);
                return actor
                  ? memo2.set(sActorId, actor.set('actionsMembers', List().push(actionId)))
                  : memo2;
              }
              return memo2;
            },
            result,
          )
          : result;
      }
      if (includeChildren) {
        const actorsAsAssociationForAction = action.get('actorsAssociations');
        result = actorsAsAssociationForAction
          ? actorsAsAssociationForAction.reduce(
            (memo2, actorId) => {
              const sActorId = actorId.toString();
              // makes sure not already included in direct or indirect action
              if (
                !memo2.getIn([sActorId, 'actions'])
                || !memo2.getIn([sActorId, 'actions']).includes(actionId)
              ) {
                // if already present, add action id
                if (memo2.get(sActorId)) {
                  if (memo2.getIn([sActorId, 'actionsAsParent'])) {
                    if (!memo2.getIn([sActorId, 'actionsAsParent']).includes(actionId)) {
                      return memo2.setIn(
                        [sActorId, 'actionsAsParent'],
                        memo2.getIn([sActorId, 'actionsAsParent']).push(actionId),
                      );
                    }
                    return memo2;
                  }
                  return memo2.setIn([sActorId, 'actionsAsParent'], List().push(actionId));
                }
                const actor = actors.get(sActorId);
                return actor
                  ? memo2.set(sActorId, actor.set('actionsAsParent', List().push(actionId)))
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
