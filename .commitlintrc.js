// feat：新功能（feature, 如新建功能分支的首次提交，或功能分支的关联需求有新增功能）
// fix：修复bug
// improvement: 当前功能分支的优化，或功能分支的关联需求优化
// docs：只有文档的变化，(readme, .md文件的改动)
// style： 不影响代码含义和运行的代码样式的改动（注释：不是指css的改动）：包括（空格，代码格式，补全分号等）
// refactor：重构（即不是新增功能，也不是修改bug的代码变动）
// perf:  提升代码运行性能的改动
// test：增加测试文件，或者改动现存的测试文件
// build: 影响构建过程，和外部依赖的改动，如 webpack,npm 相关文件的变动
// ci:   影响持续集成的配置文件或脚本的改动
// chore：其他不改变src 文件夹的改动，如(.gitignore的改动，或者不好归类的放在这个类型下)
// revert:  重新提交之前的提交（revert命令会产生新的提交，和reset 不会）

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'improvement', 'docs', 'style', 'refactor', 'test', 'build', 'ci', 'chore', 'revert']],
  },
};
