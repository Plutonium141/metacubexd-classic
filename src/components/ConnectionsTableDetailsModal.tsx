import {
  IconArrowsSort,
  IconCircleArrowDownFilled,
  IconCircleArrowRightFilled,
  IconDevices,
  IconNetwork,
  IconRuler,
  IconServer2,
} from '@tabler/icons-solidjs'
import byteSize from 'byte-size'
import type { Component } from 'solid-js'
import { Modal } from '~/components'
import { formatIPv6, formatTime, formatTimeFromNow } from '~/helpers'
import { useI18n } from '~/i18n'
import { allConnections, useConnections } from '~/signals'

const { activeConnections } = useConnections()

export const ConnectionsTableDetailsModal: Component<{
  ref?: (el: HTMLDialogElement) => void
  selectedConnectionID?: string
}> = (props) => {
  const [t] = useI18n()
  const conn = createMemo(() =>
    allConnections().find(({ id }) => id === props.selectedConnectionID),
  )
  const downloadSpeed = createMemo(
    () =>
      activeConnections().find(({ id }) => id === props.selectedConnectionID)
        ?.downloadSpeed || 0,
  )
  const uploadSpeed = createMemo(
    () =>
      activeConnections().find(({ id }) => id === props.selectedConnectionID)
        ?.uploadSpeed || 0,
  )

  return (
    <Modal
      ref={(el) => props.ref?.(el)}
      icon={<IconNetwork size={24} />}
      title={t('connectionsDetails')}
    >
      <Show when={props.selectedConnectionID}>
        <div class="space-y-4">
          <div class="card-compact card bg-base-200">
            <div class="card-body p-4">
              <h2 class="card-title">
                <IconServer2 />
                {t('host')}
              </h2>
              <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <div class="table-title">{t('host')}</div>
                <div class="table-content">
                  {conn()?.metadata.host ||
                    conn()?.metadata.sniffHost ||
                    formatIPv6(conn()?.metadata.destinationIP || '')}
                  {':'}
                  {conn()?.metadata.destinationPort}
                </div>

                <div class="table-title">{t('destination')}</div>
                <div class="table-content">
                  {formatIPv6(conn()?.metadata.destinationIP || '') ||
                    t('unknown')}
                </div>

                <div class="table-title">{t('geoip')}</div>
                <div class="table-content">
                  {conn()?.metadata.destinationGeoIP || t('unknown')}
                </div>

                <div class="table-title">{t('ipasn')}</div>
                <div class="table-content">
                  {conn()?.metadata.destinationIPASN || t('unknown')}
                </div>

              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 items-center justify-items-stretch px-8">
            <div class="justify-self-start text-sm">
              {t('upload')} : {byteSize(uploadSpeed()).toString()}/s
            </div>
            <div class="justify-self-center">
              <IconArrowsSort size={48} />
            </div>
            <div class="justify-self-end text-sm">
              {t('download')} : {byteSize(downloadSpeed()).toString()}/s
            </div>
          </div>

          <div class="card-compact card bg-base-200">
            <div class="card-body p-4">
              <h2 class="card-title">
                <IconDevices />
                {t('source')}
              </h2>
              <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <Show when={conn()?.metadata.type != 'Inner'}>
                  <div class="table-title">{t('sourceIP')}</div>
                  <div class="table-content">
                    {formatIPv6(conn()?.metadata.sourceIP || '')}:
                    {conn()?.metadata.sourcePort}
                  </div>

                  <div class="table-title">{t('geoip')}</div>
                  <div class="table-content">
                    {conn()?.metadata.sourceGeoIP || t('unknown')}
                  </div>

                  <div class="table-title">{t('ipasn')}</div>
                  <div class="table-content">
                    {conn()?.metadata.sourceIPASN || t('unknown')}
                  </div>
                </Show>

                <Show when={conn()?.metadata.type != 'Inner'}>
                  <div class="table-title">{t('inboundIP')}</div>
                  <div class="table-content">
                    {conn()?.metadata.inboundIP !== '::'
                      ? formatIPv6(conn()?.metadata.inboundIP || '')
                      : '0.0.0.0'}
                    :{conn()?.metadata.inboundPort}
                  </div>
                </Show>

                <Show when={conn()?.metadata.type != 'Inner'}>
                  <div class="table-title">{t('inboundUser')}</div>
                  <div class="table-content">
                    {conn()?.metadata.inboundUser || '-'}
                  </div>
                </Show>

                <div class="table-title">{t('type')}</div>
                <div class="table-content">
                  {conn()?.metadata.type}({conn()?.metadata.network})
                </div>

                <div class="table-title">{t('dnsMode')}</div>
                <div class="table-content">{conn()?.metadata.dnsMode}</div>

                <div class="table-title">{t('remoteDestination')}</div>
                <div class="table-content">
                  {conn()?.metadata.remoteDestination || t('unknown')}
                </div>

                <div class="table-title">{t('connectStartTime')}</div>
                <div class="table-content">
                  {formatTime(conn()?.start || '')}
                  <br />
                  {formatTimeFromNow(conn()?.start || '')}
                </div>
              </div>
            </div>
          </div>

          <div class="card-compact card bg-base-200">
            <div class="card-body p-4">
              <h2 class="card-title">
                <IconRuler />
                {t('chains')}
              </h2>
              <Show when={conn()?.metadata.type != 'Inner'}>
                <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                  <div class="table-title">{t('rule')}</div>
                  <div class="table-content">
                    {conn()?.rule}:{conn()?.rulePayload}
                  </div>
                </div>
              </Show>
              <ul class="timeline timeline-vertical timeline-compact">
                <For each={conn()?.chains.slice().reverse()}>
                  {(node, index) => (
                    <li>
                      <Show when={index() > 0}>
                        <hr />
                      </Show>
                      <div class="timeline-start py-1">
                        <time class="italic">{node}</time>
                      </div>

                      <div class="timeline-middle">
                        <Show
                          when={index() + 1 !== conn()?.chains.length}
                          fallback={<IconCircleArrowRightFilled />}
                        >
                          <IconCircleArrowDownFilled />
                        </Show>
                      </div>

                      <Show when={index() + 1 !== conn()?.chains.length}>
                        <hr />
                      </Show>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          </div>

          <div class="collapse-arrow collapse bg-base-200">
            <input type="checkbox" />
            <div class="collapse-title">JSON</div>
            <div class="collapse-content overflow-auto">
              <pre class="overflow-scroll">
                <code>{JSON.stringify(conn(), null, 2)}</code>
              </pre>
            </div>
          </div>
        </div>
      </Show>
    </Modal>
  )
}
