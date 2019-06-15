class HistoryTool
  constructor: (ops)->
    console.log "✓ History Functionality"
#     save_events = $.map(window.storage.keys(), (el, i) ->
#       flag = el.split('_')[0]
#       time = parseInt(el.split('_')[1])
#       if flag == 'saveevent'
#         return time
#       return
#     )
#     latest_event = _.max(save_events)
#     @current_save = latest_event
#     return

#   save: ->
#     @toolbox.clearTool()
#     s = Math.floor(Date.now() / 1000)
#     timestamp_key = 'saveevent_' + s
#     console.log 'Timestamp', timestamp_key
#     storage.set timestamp_key, JigExporter.export(@paper, @canvas, JigExporter.JSON, false)
#     @current_save = s
#     return
#   redo: ->
#     @toolbox.clearTool()
#     save_events = $.map(window.storage.keys(), (el, i) ->
#       flag = el.split('_')[0]
#       time = parseInt(el.split('_')[1])
#       if flag == 'saveevent'
#         return time
#       return
#     )
#     scope = this
#     rel_events = _.filter(save_events, (t) ->
#       t > scope.current_save
#     )
#     if _.isEmpty(rel_events)
#       console.log 'Can\'t redo...'
#       return
#     @clear()
#     rel_event = _.min(rel_events)
#     console.log 'redoing', rel_event
#     @loadJSON storage.get('saveevent_' + rel_event)
#     @current_save = rel_event
#     return
#   undo: ->
#     @toolbox.clearTool()
#     save_events = $.map(window.storage.keys(), (el, i) ->
#       flag = el.split('_')[0]
#       time = parseInt(el.split('_')[1])
#       if flag == 'saveevent'
#         return time
#       return
#     )
#     scope = this
#     rel_events = _.filter(save_events, (t) ->
#       t < scope.current_save
#     )
#     if _.isEmpty(rel_events)
#       console.log 'Can\'t undo...'
#       return
#     @clear()
#     rel_event = _.max(rel_events)
#     @loadJSON storage.get('saveevent_' + rel_event)
#     @current_save = rel_event
#     return
#   revert: ->
#     @toolbox.clearTool()
#     save_events = $.map(window.storage.keys(), (el, i) ->
#       flag = el.split('_')[0]
#       time = parseInt(el.split('_')[1])
#       if flag == 'saveevent'
#         return time
#       return
#     )
#     if _.isEmpty(save_events)
#       console.log 'No save events to revert to...'
#       return
#     console.log 'save events', save_events
#     last_event = _.min(save_events)
#     @clear()
#     console.log 'loading json', last_event
#     @loadJSON storage.get('saveevent_' + last_event)
#     @current_save = last_event
#     return
#   clear_history: ->
#     @toolbox.clearTool()
#     storage.clear()
#     @clear()
#     @save()
#     return
#   fast_forward: ->
#     @toolbox.clearTool()
#     save_events = $.map(window.storage.keys(), (el, i) ->
#       flag = el.split('_')[0]
#       time = parseInt(el.split('_')[1])
#       if flag == 'saveevent'
#         return time
#       return
#     )
#     if _.isEmpty(save_events)
#       console.log 'No save events to revert to...'
#       return
#     console.log 'save events', save_events
#     last_event = _.max(save_events)
#     @clear()
#     console.log 'loading json', last_event
#     @loadJSON storage.get('saveevent_' + last_event)
#     @current_save = last_event
#     return

