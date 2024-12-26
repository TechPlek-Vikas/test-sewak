export const STRATEGY = Object.freeze({
  ANY: 'ANY',
  ALL: 'ALL'
});

// POINT : Base Strategy Class
class PermissionStrategy {
  match(myPermissions, allowedPermissions) {
    throw new Error('match method must be implemented in derived class');
  }
}

// POINT : Any Match Strategy
class AnyMatchStrategy extends PermissionStrategy {
  match(myPermissions, allowedPermissions) {
    for (const module in allowedPermissions) {
      if (myPermissions[module]?.some((perm) => allowedPermissions[module].includes(perm))) {
        return true;
      }
    }
    return false;
  }
}

// POINT : All Match Strategy
class AllMatchStrategy extends PermissionStrategy {
  match(myPermissions, allowedPermissions) {
    for (const module in allowedPermissions) {
      if (!myPermissions[module] || !allowedPermissions[module].every((perm) => myPermissions[module].includes(perm))) {
        return false;
      }
    }
    return true;
  }
}

// Strategy Factory
class StrategyFactory {
  static getStrategy(strategy) {
    console.log(`🚀 ~ StrategyFactory ~ strategy:`, strategy);
    switch (strategy) {
      case STRATEGY.ANY:
        return new AnyMatchStrategy();
      case STRATEGY.ALL:
        return new AllMatchStrategy();
      default:
        throw new Error(`Strategy "${strategy}" is not implemented`);
    }
  }
}

export { StrategyFactory, AnyMatchStrategy, AllMatchStrategy };
