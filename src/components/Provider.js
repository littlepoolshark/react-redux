import { Component, Children } from 'react'
import PropTypes from 'prop-types'
import { storeShape, subscriptionShape } from '../utils/PropTypes'
import warning from '../utils/warning'

let didWarnAboutReceivingStore = false
function warnAboutReceivingStore() {
  if (didWarnAboutReceivingStore) {//如果已经警告就不再警告。即，通过设置一个标志位来达到只警告一次的目的。
    return
  }
  didWarnAboutReceivingStore = true
  
  //从这段警告里面，我可以获取这样的信息：
  // Redux 2.x and React Redux 2.x 不再默认支持reducer的热更新
  warning(
    '<Provider> does not support changing `store` on the fly. ' +
    'It is most likely that you see this error because you updated to ' +
    'Redux 2.x and React Redux 2.x which no longer hot reload reducers ' +
    'automatically. See https://github.com/reactjs/react-redux/releases/' +
    'tag/v2.0.0 for the migration instructions.'
  )
}

export function createProvider(storeKey = 'store', subKey) {
    const subscriptionKey = subKey || `${storeKey}Subscription`

    class Provider extends Component {
        getChildContext() {
          return { [storeKey]: this[storeKey], [subscriptionKey]: null }
        }

        constructor(props, context) {
          super(props, context)
          this[storeKey] = props.store;
        }

        render() {
          //该reactAPI会检查传入该组价的children是否只有一个child，是的话就返回这个child组件，否则的话抛出错误。
          return Children.only(this.props.children)
        }
    }

    if (process.env.NODE_ENV !== 'production') {
      Provider.prototype.componentWillReceiveProps = function (nextProps) {
        if (this[storeKey] !== nextProps.store) {
          warnAboutReceivingStore()
        }
      }
    }

    Provider.propTypes = {
        store: storeShape.isRequired,
        children: PropTypes.element.isRequired,
    }
    Provider.childContextTypes = {
        [storeKey]: storeShape.isRequired,
        [subscriptionKey]: subscriptionShape,
    }

    return Provider
}

export default createProvider()
