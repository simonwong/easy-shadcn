import { test, expect } from 'vitest';
import React, { useEffect, useRef, useState } from 'react';
import { render, screen, fireEvent, waitForElementToBeRemoved, act } from '@testing-library/react';
import ModalHelper, { ModalHelperHandler } from '../modal-helper/index';
import { ShadCNModalProps } from '../modal-helper/type';

const { Provider, create, useModal, useModalHolder, register, reducer } = ModalHelper;

const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error; info?: React.ErrorInfo }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ hasError: true, error, info });
  }

  renderDefaultError() {
    return <div>Something went wrong.</div>;
  }

  render() {
    if (this.state.hasError) {
      return <div>{this.renderDefaultError()}</div>;
    }
    return this.props.children;
  }
}

test('throw error if no provider', async () => {
  render(<div />);

  let err;
  await act(async () => {
    try {
      await ModalHelper.show('test-modal-without-provider');
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(Error);
  });
});

const TestModal = ({
  visible = false,
  onExited,
  onClose,
  onCancel,
  children,
}: {
  visible: boolean;
  onExited: () => void;
  onClose?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
}) => {
  const lastVisibleRef = useRef(visible);
  const lastVisible = lastVisibleRef.current;
  useEffect(() => {
    if (!visible && lastVisible) {
      setTimeout(onExited, 30);
    }
  }, [visible, onExited, lastVisible]);

  lastVisibleRef.current = visible;
  return (
    <div>
      TestModal {visible} <div>{children}</div>
      <p>
        <button onClick={onClose}>Close</button>
      </p>
      <p>
        <button onClick={onCancel}>Cancel</button>
      </p>
    </div>
  );
};

const HocTestModal = create(({ name = 'nate' }: { name?: string }) => {
  const modal = useModal();
  const remove = () => modal.remove();
  return (
    <TestModal visible={modal.visible} onExited={remove} onClose={remove}>
      <label>{name}</label>
      <div>HocTestModal</div>
    </TestModal>
  );
});

test('provider children is correctly rendered', () => {
  render(
    <Provider>
      <span>learn nice modal</span>
    </Provider>
  );
  const childText = screen.getByText(/learn nice modal/i);
  expect(childText).toBeInTheDocument();
});

const testUseModal = async <T extends Record<string, unknown>>(
  modal: ModalHelperHandler<T>,
  props: T = {} as T
) => {
  let modalTextElement = screen.queryByText('HocTestModal');
  expect(modalTextElement).not.toBeInTheDocument();

  const resolved: unknown[] = [];
  let rejected: Error | null = null;

  act(() => {
    void modal.show(props).then((res = true) => resolved.push(res));
  });

  act(() => {
    void modal.show(props).then((res = true) => resolved.push(res));
  });
  modalTextElement = screen.queryByText('HocTestModal');
  expect(modalTextElement).toBeInTheDocument();

  modalTextElement = screen.queryByText('bood');
  expect(modalTextElement).toBeInTheDocument();

  act(() => {
    modal.resolve({ resolved: true });
    void modal.hide();
  });

  modalTextElement = screen.queryByText('HocTestModal');
  expect(modalTextElement).toBeInTheDocument();

  await waitForElementToBeRemoved(screen.queryByText('HocTestModal'));

  expect(resolved).toEqual([{ resolved: true }, { resolved: true }]);
  expect(rejected).toBe(null);

  act(() => {
    void modal.show().catch((err: Error) => {
      rejected = err;
    });
  });

  act(() => {
    modal.reject(new Error('sample error'));
    void modal.hide();
  });

  await waitForElementToBeRemoved(screen.queryByText('HocTestModal'));
  expect(rejected && (rejected as Error).message).toBe('sample error');
};

test('useModal by id of registered modal', async () => {
  const hocTestModalId = 'hoc-test-modal';
  register(hocTestModalId, HocTestModal, { name: 'bood' });
  let modal!: ModalHelperHandler;
  const App = () => {
    modal = useModal(hocTestModalId);
    return <Provider />;
  };
  render(<App />);
  await testUseModal(modal);
});

test('useModal by id of declared modal via JSX', async () => {
  let modal!: ModalHelperHandler;
  const App = () => {
    modal = useModal('mytestmodal');
    return (
      <Provider>
        <HocTestModal id="mytestmodal" name="bood" />
      </Provider>
    );
  };
  render(<App />);
  await testUseModal(modal);
});

// test('useModal by id of declared modal via ModalDef', async () => {
//   let modal;
//   const App = () => {
//     modal = useModal('mytestmodal2');
//     return (
//       <Provider>
//         <ModalDef id="mytestmodal2" component={HocTestModal} />
//       </Provider>
//     );
//   };
//   render(<App />);
//   await testUseModal(modal, { name: 'bood' });
// });

test('useModal by component directly', async () => {
  let modal!: ModalHelperHandler<{ name: string }>;
  const App = () => {
    modal = useModal(HocTestModal, { name: 'bood' });
    return <Provider />;
  };
  render(<App />);
  await testUseModal(modal);
});

test('show/hide modal by id with globally API', async () => {
  const hocTestModalId = 'hoc-test-modal';
  register(hocTestModalId, HocTestModal);
  render(<Provider />);
  let modalTextElement = screen.queryByText('HocTestModal');
  expect(modalTextElement).not.toBeInTheDocument();

  act(() => {
    void ModalHelper.show(hocTestModalId);
  });
  modalTextElement = screen.queryByText('HocTestModal');
  expect(modalTextElement).toBeInTheDocument();

  act(() => {
    void ModalHelper.hide(hocTestModalId);
  });
  modalTextElement = screen.queryByText('HocTestModal');
  expect(modalTextElement).toBeInTheDocument();

  await waitForElementToBeRemoved(() => screen.queryByText('HocTestModal'));
});

test('show/hide modal by component with globally API', async () => {
  const HocTestModal = create(({ name = 'nate' }: { name: string }) => {
    const modal = useModal();
    const remove = () => modal.remove();

    return (
      <TestModal visible={modal.visible} onExited={remove} onClose={remove}>
        <label>{name}</label>
        <div>HocTestModal</div>
      </TestModal>
    );
  });
  render(<Provider />);
  let modalTextElement = screen.queryByText('HocTestModal');
  expect(modalTextElement).not.toBeInTheDocument();

  act(() => {
    void ModalHelper.show(HocTestModal);
  });
  modalTextElement = screen.queryByText('HocTestModal');
  expect(modalTextElement).toBeInTheDocument();

  act(() => {
    void ModalHelper.hide(HocTestModal);
  });
  modalTextElement = screen.queryByText('HocTestModal');
  expect(modalTextElement).toBeInTheDocument();

  await waitForElementToBeRemoved(() => screen.queryByText('HocTestModal'));
});

test('hide an invalid id does nothing', () => {
  render(<Provider />);
  act(() => {
    void ModalHelper.hide('abc');
  });
});

test('dispatch invalid action does nothing', () => {
  const s1 = { p1: 'something' };
  const s2 = reducer(s1, { type: 'some-action' });
  expect(s1).toBe(s2);
});

test('useModal without context provider will throw exception', () => {
  console.error = () => null;
  render(
    <ErrorBoundary>
      <HocTestModal />
    </ErrorBoundary>
  );
  expect(screen.queryByText('Something went wrong.')).toBeInTheDocument();
});

test('use invalid modal id only show warning msg.', () => {
  render(<Provider />);
  let warnMsg: string | null = null;
  console.warn = (msg: string) => (warnMsg = msg);
  act(() => {
    void ModalHelper.show('invalidid');
  });
  expect(warnMsg).toBe(
    'No modal found for id: invalidid. Please check the id or if it is registered or declared via JSX.'
  );
});

test('there is empty initial state', () => {
  // @ts-expect-error - 忽略类型检查
  const s = reducer(undefined, { type: 'some-action' });
  expect(s).toEqual({});
});

test('modal with defaultVisible prop', async () => {
  render(
    <Provider>
      <HocTestModal defaultVisible id="default-visible-modal" />
    </Provider>
  );

  const modalTextElement = screen.queryByText('HocTestModal');
  expect(modalTextElement).toBeInTheDocument();

  act(() => {
    void ModalHelper.hide('default-visible-modal');
  });

  await waitForElementToBeRemoved(screen.queryByText('HocTestModal'));
});

// test('modal with redux integration', async () => {
//   const dispatch = () => null;
//   const modals = {};
//   const App = () => <Provider dispatch={dispatch} modals={modals} />;
//   render(<App />);
// });

const testHelper = async (
  Modal: React.ComponentType<ShadCNModalProps & { children: React.ReactNode }>,
  text: string,
  keepMounted = false
) => {
  const HocModal = create(({ name }: { name: string }) => {
    const modal = useModal();
    return (
      <Modal {...modal.modalProps}>
        <label>{name}</label>
      </Modal>
    );
  });

  render(
    <Provider>
      <HocModal keepMounted={keepMounted} id="helper-modal" name={text} />
    </Provider>
  );

  let modalTextElement = screen.queryByText(text);
  if (keepMounted) {
    expect(modalTextElement).toBeInTheDocument();
  } else {
    expect(modalTextElement).not.toBeInTheDocument();
  }

  act(() => {
    void ModalHelper.show('helper-modal', { name: text });
  });

  modalTextElement = screen.queryByText(text);
  expect(modalTextElement).toBeInTheDocument();

  act(() => {
    fireEvent.click(screen.getByText('Close'));
  });
  modalTextElement = screen.queryByText(text);
  expect(modalTextElement).toBeInTheDocument();

  if (keepMounted) {
    await delay(50);
    expect(screen.queryByText(text)).toBeInTheDocument();
  } else {
    await waitForElementToBeRemoved(() => screen.queryByText(text));
  }
};

const ShadCNModal = ({
  open,
  onOpenChange,
  afterClose,
  children,
}: ShadCNModalProps & { children: React.ReactNode }) => {
  return (
    <TestModal
      visible={open!}
      onClose={() => onOpenChange!(false)}
      onCancel={() => onOpenChange!(false)}
      onExited={afterClose!}
    >
      {children}
    </TestModal>
  );
};

const HocShadCNModal = create(({ name = 'nate' }: { name?: string }) => {
  const modal = useModal();
  return (
    <ShadCNModal {...modal.modalProps}>
      <h1>HocShadCNModal</h1>
      <label>{name}</label>
    </ShadCNModal>
  );
});

test('test shadCN modal helper', async () => {
  await testHelper(ShadCNModal, 'ShadCNModal');
  await testHelper(ShadCNModal, 'ShadCNModal', true);
});

test('test shadCN modal onCancel', async () => {
  render(<Provider />);

  act(() => {
    void ModalHelper.show(HocShadCNModal, { name: 'cancelTest' });
  });
  fireEvent.click(screen.getByText('Cancel'));
  await waitForElementToBeRemoved(() => screen.queryByText('cancelTest'));
});

test('test useModalHolder', async () => {
  const TestUseModalHolder = () => {
    const [actions, ModalHolder] = useModalHolder(HocShadCNModal);
    const [name, setName] = useState('first name');

    return (
      <Provider>
        <button
          onClick={() => {
            void actions?.show();
          }}
        >
          Open Modal
        </button>
        <button onClick={() => setName('second name')}>Change Name</button>
        <ModalHolder name={name} />
      </Provider>
    );
  };

  render(<TestUseModalHolder />);

  let modalTextElement = screen.queryByText('HocShadCNModal');
  expect(modalTextElement).not.toBeInTheDocument();

  act(() => {
    fireEvent.click(screen.getByText('Open Modal'));
  });

  modalTextElement = screen.queryByText('HocShadCNModal');
  expect(modalTextElement).toBeInTheDocument();

  let nameTextElement = screen.queryByText('first name');
  expect(nameTextElement).toBeInTheDocument();

  act(() => {
    fireEvent.click(screen.getByText('Change Name'));
  });

  nameTextElement = screen.queryByText('second name');
  expect(nameTextElement).toBeInTheDocument();

  act(() => {
    fireEvent.click(screen.getByText('Close'));
  });

  await waitForElementToBeRemoved(() => screen.queryByText('HocShadCNModal'));
});
