import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('ostoslistadb.db');

export default function App() {
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [shoppinglist, setShoppingList] = useState([]);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'create table if not exists shoppinglist (id integer primary key not null, products int, amount text);'
      );
    });
    updateList();
  }, []);

  const saveItem = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'insert into shoppinglist (products, amount) values (?, ?);',
        [product, amount],
        updateList
      );
    });
  };

  const updateList = () => {
    db.transaction((tx) => {
      tx.executeSql('select * from shoppinglist;', [], (_, { rows }) => setShoppingList(rows._array));
    });
  };

  const deleteItem = (id) => {
    db.transaction(
      (tx) => {
        tx.executeSql(`delete from shoppinglist where id = ?;`, [id], updateList);
      },
      null,
      updateList
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text>{item.products}</Text>
      <Text>{item.amount}</Text>
      <Button title="Delete" onPress={() => deleteItem(item.id)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Product"
        value={product}
        onChangeText={(text) => setProduct(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={(text) => setAmount(text)}
      />
      <Button title="Add" onPress={saveItem} />
      <Text style={styles.title}>Shopping List</Text>
      <FlatList
        style={styles.list}
        data={shoppinglist}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => (
          <View
            style={{
              height: 5,
              width: '80%',
              backgroundColor: '#fff',
              marginLeft: '10%',
            }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    marginBottom: 10,
  },
  list: {
    flexGrow: 0,
    width: '80%',
  },
});
