import React, { useState, useEffect, useRef } from "react";
import { useIsFocused } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  Linking,
} from "react-native";
import * as Permissions from "expo-permissions";
import { Icon, Header, Left, Right, Body, Button } from "native-base";
import Messages from "../components/Messages";
import TrendingStocks from "../components/TrendingStocks";
import { Feather } from "@expo/vector-icons";
import AddGroup from "./Sub/AddGroup";
import fire, { firestore } from "../database/firebase";

const Chat = (props) => {
  const isVisible = useIsFocused();
  const [groups, setGroups] = useState([]);
  const [publicgroups, setpublicgroups] = useState([]);
  const [Chatheads, setChatheads] = useState([]);

  useEffect(() => {
    // askPermission();
    props.navigation.setOptions({
      gesturesEnabled: false,
    });

    if (isVisible) {
      getChats();
    }
  }, [isVisible]);

  async function askPermission() {
    try {
      const { existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        Alert.alert(
          "Enable Notifications",
          "Open your notification settings and turn on notifications for ChartBot",
          [
            { text: "cancel", onPress: () => console.log("cancel") },
            { text: "Allow", onPress: () => Linking.openURL("app-settings:") },
          ],
          { cancelable: false }
        );
        return;
      }
    } catch (e) {
      alert(e.message);
      console.log(e);
    }
  }

  function getChats() {
    const db = firestore;
    var groupArray = [];
    var pubgroupArray = [];

    var ChatHeadsArr = [];
    var UserId = fire.auth().currentUser.uid;

    db.collection("publicgroups").onSnapshot(function (snapshot) {
      snapshot.docChanges().forEach(function (change) {
        if (change.type == "added") {
          console.log("New Group: ", change.doc.data());
          pubgroupArray.push(change.doc.data());
        }
        if (change.type === "modified") {
          console.log("Modified Group: ", change.doc.data());
        }
        if (change.type === "removed") {
          console.log("Removed Group", change.doc.data());
        }
        setpublicgroups(pubgroupArray);
      });
    });

    db.collection("users")
      .doc(UserId)
      .collection("Groups")
      .onSnapshot(function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
          groupArray.push(change.doc.data());
          setGroups(groupArray);
        });
      });

    db.collection("users")
      .doc(UserId)
      .collection("ChatHeads")
      .onSnapshot(function (snapshot) {
        snapshot.docChanges().forEach(function (anotherSnapshot) {
          // ChatHeadsArr.push(anotherSnapshot.doc.data())
          for (var i = 0; i < anotherSnapshot.doc.data.length; i++) {
            ChatHeadsArr.push({
              name: anotherSnapshot.doc.data().name,
              uid: anotherSnapshot.doc.data().uid,
            });
          }
          setChatheads(ChatHeadsArr);
        });
      });
  }
  const onShare = async () => {
    try {
      const result = await Share.share({
        message:
          "Hey - I have an invite to StockChat and want you to join. Here is the link! https://stockchatapp.com",
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Header
          style={{
            backgroundColor: "#282c34",
            borderBottomWidth: 0.2,
            borderBottomColor: "#282c34",
          }}
        >
          <Left>
            <Text style={styles.logotext}>#STOCKCHAT</Text>
          </Left>
          <Right>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TouchableOpacity
                style={styles.invite}
                onPress={() => {
                  props.navigation.navigate("Bank");
                }}
              >
                <Feather
                  style={{
                    color: "#FFF",
                    fontWeight: "bold",
                    paddingHorizontal: Platform.OS === "ios" ? 10 : 10,
                    fontSize: 20,
                  }}
                  name="credit-card"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.invite} onPress={onShare}>
                <Feather
                  style={{
                    color: "#FFF",
                    fontWeight: "bold",
                    paddingHorizontal: Platform.OS === "ios" ? 10 : 10,
                    fontSize: 20,
                  }}
                  name="user-plus"
                />
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#FFF",
                    //paddingLeft: 10
                  }}
                >
                  Invite
                </Text>
              </TouchableOpacity>
            </View>
          </Right>
        </Header>
      </View>

      <ScrollView style={styles.col2}>
        <View style={styles.headerContainer}>
          <Text style={styles.header2}>Trending Stocks</Text>
          {/* <View>
            <TouchableOpacity
              style={styles.invite}
              onPress={onShare}
              title="Share"
              //onPress={() => props.navigation.navigate("InviteFriends")}
            >
              <Feather name="user-plus" size={20} color="#F5F8FA" />
              <Text style={{ color: "#F5F8FA", fontWeight: "500" }}>
                {" "}
                Invite{" "}
              </Text>
            </TouchableOpacity>
          </View> */}
        </View>

        <TrendingStocks {...props} />

        {/* <TextInput
          style={styles.inputStyle}
          placeholder="Search for groups or messages"
          // value={email}
          // onChangeText={val => setEmail(val)}
        /> */}

        {/* <View style={styles.col}>
          <Text style={styles.header}>Stock Chats</Text>
          <TouchableOpacity
            onPress={() => props.navigation.navigate("AddGroup")}
          >
            <AntDesign name="pluscircleo" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={{ paddingVertical: 20, marginHorizontal: 10 }}>
          {/* <TouchableOpacity
            style={styles.btn}
            // onPress={() => {
            //   firebase
            //     .auth()
            //     .signOut()
            //     .then(function() {
            //       props.navigation.navigate("GetStarted");
            //     });
            // }}
          >
            <Text
              style={{
                color: "#F5F8FA",
                fontSize: 19,
                fontFamily: "Montserrat_700Bold"
              }}
            >
              Connect Portfolio
            </Text>
          </TouchableOpacity> */}
        {/* <StockGroupCard
            ticker="$TSLA"
            pctchange="+1.02%"
            onPress={() => {
              props.navigation.navigate("StockChat", {
                //itemId: "TSLA",
                itemName: "$TSLA",
                itemPic: "https://i.stack.imgur.com/l60Hf.png"
              });
            }}
            msg="This stock is trending"
          /> */}
        {/* <StockGroupCard
            ticker="$SQ"
            pctchange="+4.55%"
            onPress={() => {
              props.navigation.navigate("GroupProfile");

              // onPress={() => {
              //   props.navigation.navigate("StockChat", {
              //     // itemId: item.id,
              //     // itemName: item.login,
              //     itemPic: "https://i.stack.imgur.com/l60Hf.png",
              //     itemName: "$SQ"
            }}
            msg="This stock is trending"
          /> */}
        {/* <StockGroupCard
            ticker="$NET"
            pctchange="+3.521%"
            onPress={() => {
              props.navigation.navigate("StockChat", {
                itemName: "$NET",
                // itemId: item.id,
                // itemName: item.login,
                itemPic: "https://i.stack.imgur.com/l60Hf.png"
              });
            }}
            msg="This stock is trending"
          /> */}
        {/* </View>  */}
        <View style={styles.col}>
          <Text style={styles.header2}>Group Chats</Text>
          {/* <TouchableOpacity
            onPress={() => props.navigation.navigate("AddGroup")}
          >
            <AntDesign name="pluscircleo" size={24} color="#FFF" />
          </TouchableOpacity> */}
        </View>
        <View style={{ paddingVertical: 10, marginHorizontal: 10 }}>
          <FlatList
            data={publicgroups}
            keyExtractor={(item, index) => "key" + index}
            renderItem={({ item }) => {
              const name = item.groupName;
              const totalmembers =
                item && item.totalmembers ? item.totalmembers : 0;
              const lastmessage =
                item && item.lastmessage ? item.lastmessage : "";
              return (
                <TouchableOpacity
                  onPress={() => {
                    props.navigation.navigate("Discussion", {
                      item,
                      itemPic: "https://i.stack.imgur.com/l60Hf.png",
                    });
                  }}
                >
                  <Messages
                    item={name}
                    totalmembers={totalmembers}
                    lastmessage={lastmessage}
                  ></Messages>
                </TouchableOpacity>
              );
            }}
          />

          {/* <FlatList
            data={groups}
            keyExtractor={(item, index) => "key" + index}
            renderItem={({ item }) => {
              // console.log("FLAAAAAAAAAATIST ==>", item);
              const name = item.GroupName;
              return (
                <TouchableOpacity
                  onPress={() => {
                    props.navigation.navigate("GroupChat", {
                      groupName: name,
                      itemPic: "https://i.stack.imgur.com/l60Hf.png"
                    });
                  }}
                >
                  <Messages item={name}></Messages>
                </TouchableOpacity>
              );
            }}
          /> */}
        </View>
      </ScrollView>

      {/* <TouchableOpacity
            onPress={() => props.navigation.navigate("AddGroup")}
            style={{
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.2)",
              alignItems: "center",
              justifyContent: "center",
              width: 200,
              position: "absolute",
              bottom: 10,
              right: 110,
              height: 50,
              backgroundColor: "#147efb",
              borderRadius: 100,
              flexDirection: "row"
            }}
        >
          <Feather
              style={{
                color: "#FFF",
                fontWeight: "bold",
                //paddingHorizontal: Platform.OS === "ios" ? 10 : 10,
                fontSize: 20
              }}
              name="plus"
          />
          <Text
              style={{
                textAlign: "center",
                fontSize: 18,
                fontWeight: "600",
                color: "#FFF",
                paddingLeft: 10
              }}
          >
            Start Group
          </Text>
        </TouchableOpacity> */}
    </View>
  );
};
export default Chat;

const styles = StyleSheet.create({
  list: {
    marginTop: 300,
  },
  card: {
    marginLeft: 400,
    width: 400,
    flexDirection: "row",
  },
  btn: {
    borderRadius: 16,
    //borderTopRightRadius: 0,
    backgroundColor: "#FFF",
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    //marginTop: 20,
    marginHorizontal: 10,
  },
  seperator: {
    borderColor: "lightgrey",
    borderWidth: 0.5,
    marginLeft: 30,
    marginVertical: 10,
    width: "100%",
  },
  gradient: {
    height: "100%",
    //position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    //paddingHorizontal: 20,
    paddingTop: 30,
  },
  container: {
    height: "100%",
    backgroundColor: "#282c34",
    // left: 0,
    // right: 0,
    // top: 0,
    //paddingBottom: 30
    //paddingHorizontal: 20,
    //paddingTop: 10
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    //paddingTop: 0,
    paddingHorizontal: 20,
  },
  header: {
    fontFamily: "Montserrat_700Bold",
    color: "#FFF",
    flex: 1,
    fontSize: 20,
  },
  logotext: {
    fontFamily: "Montserrat_800ExtraBold",
    color: "#FFF",
    fontSize: 22,
    paddingLeft: 10,
    width: 300,
  },
  header2: {
    fontFamily: "Montserrat_800ExtraBold",
    color: "#FFF",
    flex: 1,
    fontSize: 20,
    //paddingVertical: 10
  },
  proContainer: {
    marginRight: -20,
    alignSelf: "center",
  },
  ops: {
    // borderTopLeftRadius: 40,
    // borderTopRightRadius: 40,
    //height: "75%",
    // backgroundColor: "#282c34",
    // marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  invite: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#147efb",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  col: {
    flexDirection: "row",
    marginLeft: 20,
    alignItems: "center",
  },
  stockchats: {
    //flexDirection: "row"
    marginVertical: 10,
    marginHorizontal: 20,
    //alignItems: "center"
  },
  inputStyle: {
    width: "100%",
    marginBottom: 15,
    //paddingBottom: 15,
    paddingVertical: 10,
    paddingLeft: 15,
    alignSelf: "center",
    borderColor: "grey",
    borderWidth: 1,
    borderRadius: 20,
    marginHorizontal: 20,
    paddingRight: 20,
    fontSize: 20,
    backgroundColor: "#282c34",
    flex: 1,
  },
  day: {
    fontFamily: "Montserrat_800ExtraBold",
    color: "#FFF",
    flex: 1,
    fontSize: 20,
  },
});

// import Constants from "expo-constants";
// import * as Notifications from "expo-notifications";
// import React, { useState, useEffect, useRef } from "react";
// import { Text, View, Button, Platform } from "react-native";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

// export default function App() {
//   const [expoPushToken, setExpoPushToken] = useState("");
//   const [notification, setNotification] = useState(false);
//   const notificationListener = useRef();
//   const responseListener = useRef();

//   useEffect(() => {
//     registerForPushNotificationsAsync().then((token) =>
//       setExpoPushToken(token)
//     );

//     notificationListener.current = Notifications.addNotificationReceivedListener(
//       (notification) => {
//         setNotification(notification);
//       }
//     );

//     responseListener.current = Notifications.addNotificationResponseReceivedListener(
//       (response) => {
//         console.log(response);
//       }
//     );

//     return () => {
//       Notifications.removeNotificationSubscription(
//         notificationListener.current
//       );
//       Notifications.removeNotificationSubscription(responseListener.current);
//     };
//   }, []);

//   return (
//     <View
//       style={{
//         flex: 1,
//         alignItems: "center",
//         justifyContent: "space-around",
//       }}
//     >
//       <Text>Your expo push token: {expoPushToken}</Text>
//       <View style={{ alignItems: "center", justifyContent: "center" }}>
//         <Text>
//           Title: {notification && notification.request.content.title}{" "}
//         </Text>
//         <Text>Body: {notification && notification.request.content.body}</Text>
//         <Text>
//           Data:{" "}
//           {notification && JSON.stringify(notification.request.content.data)}
//         </Text>
//       </View>
//       <Button
//         title="Press to schedule a notification"
//         onPress={async () => {
//           await schedulePushNotification();
//         }}
//       />
//     </View>
//   );
// }

// async function schedulePushNotification() {
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title: "You've got mail! 📬",
//       body: "Here is the notification body",
//       data: { data: "goes here" },
//     },
//     trigger: { seconds: 2 },
//   });
// }

// async function registerForPushNotificationsAsync() {
//   let token;
//   if (Constants.isDevice) {
//     const {
//       status: existingStatus,
//     } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") {
//       alert("Failed to get push token for push notification!");
//       return;
//     }
//     token = (await Notifications.getExpoPushTokenAsync()).data;
//     console.log(token);
//   } else {
//     alert("Must use physical device for Push Notifications");
//   }

//   if (Platform.OS === "android") {
//     Notifications.setNotificationChannelAsync("default", {
//       name: "default",
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: "#FF231F7C",
//     });
//   }

//   return token;
// }
